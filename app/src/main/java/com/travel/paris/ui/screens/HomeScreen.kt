package com.travel.paris.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun HomeScreen(
    onOpenMap: () -> Unit,
    onOpenAI: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "✈️ Travel Planner")

        Spacer(modifier = Modifier.height(20.dp))

        Button(onClick = onOpenMap, modifier = Modifier.fillMaxWidth()) {
            Text("🗺️ Open Map Route")
        }

        Spacer(modifier = Modifier.height(12.dp))

        Button(onClick = onOpenAI, modifier = Modifier.fillMaxWidth()) {
            Text("🤖 AI Trip Generator")
        }
    }
}