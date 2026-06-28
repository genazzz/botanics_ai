package com.travel.paris.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun MapScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp)
    ) {
        Text("Map Route Paris")

        Spacer(modifier = Modifier.height(20.dp))

        Text("Eiffel Tower")
        Text("Louvre Museum")
        Text("Montmartre")
        Text("Notre-Dame")

        Spacer(modifier = Modifier.height(20.dp))

        Button(onClick = onBack) {
            Text("Back")
        }
    }
}