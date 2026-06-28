package com.travel.paris

object AiTripGenerator {

    fun generate(city: String, days: Int): List<String> {
        return (1..days).map { day ->
            "Day $day in $city: optimized AI route"
        }
    }
}