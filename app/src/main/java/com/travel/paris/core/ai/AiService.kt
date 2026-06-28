package com.travel.paris.core.ai

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.URL

object AiService {

    // Simple AI placeholder (can be replaced with OpenAI API)
    suspend fun generateTrip(city: String, days: Int): String = withContext(Dispatchers.IO) {
        try {
            val prompt = "Plan a $days day trip in $city"

            // Placeholder request (no API key required)
            val response = URL("https://example.com").readText()

            "AI plan for $city: $prompt | response=$response"

        } catch (e: Exception) {
            "AI offline mode: Day-based route for $city ($days days)"
        }
    }
}