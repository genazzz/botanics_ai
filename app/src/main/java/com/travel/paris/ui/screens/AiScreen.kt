package com.travel.paris.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.travel.paris.AiTripGenerator

@Composable
fun AiScreen(onBack: () -> Unit) {
    var result by remember { mutableStateOf(listOf<String>()) }

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp)
    ) {
        Text("AI Trip Generator")

        Spacer(modifier = Modifier.height(12.dp))

        Button(onClick = {
            result = AiTripGenerator.generate("Paris", 3)
        }) {
            Text("Generate Trip")
        }

        Spacer(modifier = Modifier.height(16.dp))

        result.forEach {
            Text(it)
        }

        Spacer(modifier = Modifier.height(20.dp))

        Button(onClick = onBack) {
            Text("Back")
        }
    }
}