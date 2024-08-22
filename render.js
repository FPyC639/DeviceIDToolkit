const { exec } = require('child_process');
document.getElementById("fetch-data-btn").addEventListener("click", runPowershellScript);



document.addEventListener('DOMContentLoaded', function () {
    // JavaScript to populate ComboBox (Dropdown) as soon as the page loads
    const comboBox = document.getElementById('combo-box');

    let scriptPath = ".\\resources\\static\\PnPEntity.ps1"; // Ensure the path is correctly escaped
    let command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }

        // Assuming stdout contains the list items separated by newlines
        let comboBoxData = stdout.trim().split('\n');

        // Populate ComboBox
        comboBoxData.forEach(item => {
            const option = document.createElement('option');
            option.text = item;
            option.value = item;
            comboBox.add(option);
        });

        // Event listener for ComboBox selection
        comboBox.addEventListener('change', function () {
            runPowershellScript(comboBox.value);
        });
    });
});


function runPowershellScript(comboBoxSelect) {
    let scriptPath = ".\\resources\\static\\ObtainDeets.ps1"; // Ensure the path is correctly escaped
    let command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -param1 "${comboBoxSelect}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            document.getElementById('output').textContent = `Error: ${error.message}`;
            console.error(`exec error: ${error}`);
            return;
        }
        if (stderr) {
            document.getElementById('output').textContent = `stderr: ${stderr}`;
            console.error(`stderr: ${stderr}`);
            return;
        }

        try {
            // Parse the JSON output from PowerShell
            let jsonData = JSON.parse(stdout);

            // Populate table with JSON data
            populateTable(jsonData);
        } catch (e) {
            document.getElementById('output').textContent = `Error parsing JSON: ${e.message}`;
            console.error(`Error parsing JSON: ${e}`);
        }
    });
}

function populateTable(data) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = ''; // Clear existing data

    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}