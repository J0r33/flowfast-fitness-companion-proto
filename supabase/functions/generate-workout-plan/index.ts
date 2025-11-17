import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input interface
interface WorkoutPlannerInput {
  energy: "low" | "medium" | "high";
  time_minutes: number;
  focus_areas: string[];
  goal_text: string;
  equipment: string[];
  history?: {
    sessions_completed: number;
    difficulty_bias: -1 | 0 | 1;
    days_since_last_workout: number | null;
    last_feedback?: string;
  };
}

// LLM Response interfaces (matching tool calling schema)
interface LLMContext {
  energy: string;
  time_minutes: number;
  focus_areas: string[];
  goal: string;
  equipment: string[];
}

interface LLMExercise {
  id: string;
  name: string;
  category: "cardio" | "strength" | "stretch" | "breathing";
  mode: "reps" | "time";
  sets: number;
  reps: number | null;
  duration_seconds: number | null;
  rest_between_sets_seconds: number | null;
  rest_after_exercise_seconds: number | null;
  group_type: "superset" | "circuit" | null;
  group_label: string | null;
  equipment: string[];
  note: string;
  tooltip: string;
  calories_estimate: number | null;
}

interface LLMResponse {
  version: number;
  context: LLMContext;
  exercises: LLMExercise[];
}

function buildSystemPrompt(input: WorkoutPlannerInput): string {
  const adaptationSection = input.history ? `

## ADAPTATION RULES (CRITICAL - APPLY THESE FIRST)
User workout history:
- Total sessions completed: ${input.history.sessions_completed}
- Difficulty trend: ${
  input.history.difficulty_bias === 1 ? "Workouts have been TOO EASY - increase intensity/volume" :
  input.history.difficulty_bias === -1 ? "Workouts have been TOO HARD - reduce intensity/volume" :
  "Difficulty is balanced - maintain current level"
}
- Days since last workout: ${
  input.history.days_since_last_workout === null ? "First workout" :
  input.history.days_since_last_workout === 0 ? "Today (same day)" :
  `${input.history.days_since_last_workout} days ago`
}
- Last feedback: ${input.history.last_feedback || "none yet"}

**Adaptation Guidelines (MUST FOLLOW):**
1. If difficulty_bias = 1 (too easy):
   - Increase reps by 2-3 per set
   - Add 1 extra set to key exercises
   - Reduce rest periods by 10-15 seconds
   - Include more challenging exercise variations

2. If difficulty_bias = -1 (too hard):
   - Reduce reps by 2-3 per set
   - Remove 1 set from exercises
   - Increase rest periods by 10-15 seconds
   - Use easier exercise variations or progressions

3. If last_feedback = "couldnt_finish":
   - Significantly reduce volume (fewer sets/exercises)
   - Increase rest periods
   - Focus on fundamental movements

4. If days_since_last_workout > 7:
   - Start with easier variations to ease back in
   - Focus on full-body mobility and recovery
   - Shorter workout duration

5. If days_since_last_workout = 0-1:
   - Ensure adequate recovery focus
   - Avoid overlapping muscle groups from yesterday
   - Consider active recovery or mobility work

` : '';

  return `You are a certified fitness trainer AI creating personalized workout plans.

${adaptationSection}Given the user's energy level, available time, focus areas, goal, and available equipment, generate an appropriate workout plan.

**Guidelines:**

Energy Levels:
- low: Recovery-focused, gentle movements, stretching, easy pace. Think restorative yoga, walking, light mobility work.
- medium: Moderate intensity, balanced cardio and strength. Sustainable pace, good for regular training.
- high: High intensity, challenging exercises, minimal rest. Push limits, HIIT-style workouts.

Time Management:
- Fit all exercises within the time constraint including warm-up (3-5 min) and cool-down (3-5 min)
- Account for rest periods in your total time calculation
- Adjust exercise count and duration to fit perfectly within the time window

Focus Areas:
- Prioritize the requested focus areas in your exercise selection
- Balance the workout to avoid overloading one muscle group
- Include compound movements for efficiency when time is limited

Rest Periods (adjust based on intensity):
- Between sets: 20-45s (high energy), 30-60s (medium), 45-90s (low)
- Between exercises: 30-60s (high energy), 45-75s (medium), 60-120s (low)

Exercise Selection:
- Only include exercises that can be done with the available equipment
- If equipment list is empty, use bodyweight-only exercises
- Provide clear, actionable instructions in the tooltip field
- Use the note field for form cues, modifications, or intensity tips

Calories:
- Estimate calories per exercise based on intensity, duration, and type
- Be realistic: 5-15 cal/min for strength, 8-20 cal/min for cardio depending on intensity

Supersets/Circuits:
- Use supersets (2 exercises back-to-back) for time efficiency when appropriate
- Use circuits (3+ exercises) for metabolic conditioning or when time is very limited
- Mark exercises with matching group_label (e.g., "Superset A", "Circuit 1")

Mode Selection:
- Use "time" mode for: cardio, stretches, holds, breathing exercises
- Use "reps" mode for: strength training, bodyweight resistance exercises
- When in doubt, use "reps" for strength and "time" for cardio/flexibility

Quality over quantity:
- Better to have fewer exercises done well than many exercises rushed
- Always include proper warm-up and cool-down
- Ensure the workout is achievable and motivating, not overwhelming

Return a complete, balanced workout that the user will enjoy and benefit from.`;
}

// Tool calling schema for structured output
const WORKOUT_TOOL_SCHEMA = {
  name: "generate_workout",
  description: "Generate a personalized workout plan with exercises, rest periods, and instructions",
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      version: { 
        type: "number", 
        description: "Schema version, always 1"
      },
      context: {
        type: "object",
        additionalProperties: false,
        description: "Echo back the user's input context for logging",
        properties: {
          energy: { type: "string" },
          time_minutes: { type: "number" },
          focus_areas: { type: "array", items: { type: "string" } },
          goal: { type: "string" },
          equipment: { type: "array", items: { type: "string" } }
        }
      },
      exercises: {
        type: "array",
        description: "Array of exercises in the workout plan",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { 
              type: "string",
              description: "Unique identifier, use format: ex-1, ex-2, etc."
            },
            name: { 
              type: "string",
              description: "Exercise name, e.g., 'Push-ups', 'Jumping Jacks'"
            },
            category: {
              type: "string",
              enum: ["cardio", "strength", "stretch", "breathing"],
              description: "Exercise category"
            },
            mode: {
              type: "string",
              enum: ["reps", "time"],
              description: "Use 'reps' for strength exercises, 'time' for cardio/stretches"
            },
            sets: { 
              type: "number",
              description: "Number of sets, minimum 1"
            },
            reps: { 
              type: ["number", "null"],
              description: "Reps per set (required if mode is 'reps')"
            },
            duration_seconds: { 
              type: ["number", "null"],
              description: "Duration in seconds (required if mode is 'time')"
            },
            rest_between_sets_seconds: { 
              type: ["number", "null"],
              description: "Rest between sets in seconds"
            },
            rest_after_exercise_seconds: { 
              type: ["number", "null"],
              description: "Rest after all sets of this exercise in seconds"
            },
            group_type: {
              type: ["string", "null"],
              enum: ["superset", "circuit", null],
              description: "Grouping type if exercises are paired/grouped, null otherwise"
            },
            group_label: { 
              type: ["string", "null"],
              description: "Label for the group, e.g., 'Superset A', 'Circuit 1' (null if no grouping)"
            },
            equipment: {
              type: "array",
              items: { type: "string" },
              description: "List of equipment needed, empty array for bodyweight"
            },
            note: { 
              type: "string",
              description: "Form cues, modifications, or intensity tips"
            },
            tooltip: { 
              type: "string",
              description: "Clear, step-by-step instructions on how to perform the exercise"
            },
            calories_estimate: { 
              type: ["number", "null"],
              description: "Estimated calories burned for this exercise"
            }
          }
        }
      }
    }
  }
};

async function generateWorkoutWithRetry(
  input: WorkoutPlannerInput,
  maxRetries: number = 2
): Promise<LLMResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries + 1} to generate workout`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: buildSystemPrompt(input) },
            { 
              role: "user", 
              content: `Create a workout plan for:
- Energy level: ${input.energy}
- Available time: ${input.time_minutes} minutes
- Focus areas: ${input.focus_areas.join(", ")}
- Goal: ${input.goal_text}
- Available equipment: ${input.equipment.length > 0 ? input.equipment.join(", ") : "None (bodyweight only)"}

Generate a complete, balanced workout that fits within the time constraint.`
            }
          ],
          tools: [
            {
              type: "function",
              function: WORKOUT_TOOL_SCHEMA
            }
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_workout" }
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI Gateway error (${response.status}):`, errorText);
        
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        if (response.status === 402) {
          throw new Error("AI usage limit reached. Please add credits to continue.");
        }
        
        throw new Error(`AI Gateway returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("LLM response received:", JSON.stringify(data, null, 2));

      // Extract tool call result
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function?.name !== "generate_workout") {
        throw new Error("LLM did not return a valid tool call");
      }

      const llmResponse: LLMResponse = JSON.parse(toolCall.function.arguments);

      // Validate basic structure
      if (!llmResponse.exercises || !Array.isArray(llmResponse.exercises)) {
        throw new Error("LLM response missing exercises array");
      }

      if (llmResponse.exercises.length === 0) {
        throw new Error("LLM returned zero exercises");
      }

      // Basic validation of exercises
      for (const ex of llmResponse.exercises) {
        if (!ex.mode || !ex.name || !ex.category) {
          throw new Error(`Exercise ${ex.id} missing required fields`);
        }
      }

      console.log(`✓ Workout generated successfully with ${llmResponse.exercises.length} exercises`);
      return llmResponse;

    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      // Don't retry on rate limit or payment errors
      if (error instanceof Error && (error.message.includes("Rate limit") || error.message.includes("usage limit"))) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.log(`Retrying in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to generate workout after all retries");
}

function mapLLMResponseToWorkoutPlan(
  llmResponse: LLMResponse,
  input: WorkoutPlannerInput
) {
  const exercises = llmResponse.exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    type: ex.category,
    mode: ex.mode,
    equipment: ex.equipment,
    sets: ex.sets,
    reps: ex.mode === "reps" ? ex.reps : undefined,
    duration: ex.mode === "time" ? ex.duration_seconds : undefined,
    notes: ex.note,
    caloriesEstimate: ex.calories_estimate || 0,
    // Store LLM rest periods for use in buildWorkoutSession
    _restBetweenSets: ex.rest_between_sets_seconds || 30,
    _restAfterExercise: ex.rest_after_exercise_seconds || 60,
    // Store grouping info for WorkoutStep mapping
    _groupType: ex.group_type,
    _groupLabel: ex.group_label || undefined,
    _tooltip: ex.tooltip,
  }));

  return {
    id: `workout-${Date.now()}`,
    date: new Date().toISOString(),
    exercises,
    totalTime: input.time_minutes,
    intensity: input.energy,
    focusAreas: input.focus_areas,
    adaptedFor: {
      energy: input.energy,
      availableTime: input.time_minutes,
    },
    // Store the echoed context for debugging
    _llmContext: llmResponse.context,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: WorkoutPlannerInput = await req.json();
    
    console.log("Generating workout plan for:", input);

    // Validate input
    if (!input.energy || !["low", "medium", "high"].includes(input.energy)) {
      throw new Error("Invalid energy level");
    }
    if (!input.time_minutes || input.time_minutes < 5 || input.time_minutes > 120) {
      throw new Error("Invalid time_minutes (must be 5-120)");
    }
    if (!Array.isArray(input.focus_areas) || input.focus_areas.length === 0) {
      throw new Error("Invalid focus_areas (must be non-empty array)");
    }
    if (!input.equipment || !Array.isArray(input.equipment)) {
      throw new Error("Invalid equipment (must be array)");
    }

    const llmResponse = await generateWorkoutWithRetry(input);
    const workoutPlan = mapLLMResponseToWorkoutPlan(llmResponse, input);

    return new Response(
      JSON.stringify({ 
        success: true, 
        workout: workoutPlan,
        llm_context: llmResponse.context // Include for debugging
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in generate-workout-plan:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
