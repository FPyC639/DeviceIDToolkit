const { exec } = require('child_process');
const path = require('path');

document.addEventListener('DOMContentLoaded', function () {
    const comboBox = document.getElementById('combo-box');
    const columnsArea = document.getElementById('columns-area');
    const fetchButton = document.getElementById("fetch-data-btn");
    const pnpScriptPath = path.join(__dirname, 'static', 'PnPEntity.ps1');
    const columnsScriptPath = path.join(__dirname, 'static', 'Columns.ps1');
    // Load ComboBox Options from PnPEntity.ps1
    exec(`powershell -ExecutionPolicy Bypass -File "${pnpScriptPath}"`, (error, stdout, stderr) => {
        if (error || stderr) {
            console.error(`PnPEntity.ps1 error: ${error?.message || stderr}`);
            return;
        }

        let comboBoxData = stdout.trim().split('\n');
        comboBoxData.forEach(item => {
            const option = document.createElement('option');
            option.text = item;
            option.value = item;
            comboBox.add(option);
        });

        // Optional: Load data immediately on change
        comboBox.addEventListener('change', () => runPowershellScript(comboBox.value));
    });

    // Load Column Checkboxes from Columns.ps1
    exec(`powershell -ExecutionPolicy Bypass -File "${columnsScriptPath}"`, (error, stdout, stderr) => {
        if (error || stderr) {
            console.error(`Columns.ps1 error: ${error?.message || stderr}`);
            return;
        }

        let columns = stdout.trim().split('\n');
        columns.forEach(col => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = col;
            checkbox.checked = true;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(col));
            columnsArea.appendChild(label);
            columnsArea.appendChild(document.createElement('br'));
        });
    });

    // Fetch Button Action
    fetchButton.addEventListener("click", () => {
        runPowershellScript(comboBox.value);
    });
});

// Run the PowerShell script and populate table
function runPowershellScript(comboBoxSelect) {
    const outputDiv = document.getElementById('output');
    const scriptPath = path.join(__dirname, 'static', 'ObtainDeets.ps1');

    const selectedColumns = Array.from(document.querySelectorAll('#columns-area input:checked'))
                                 .map(cb => cb.value.trim())
                                 .filter(Boolean)
                                 .join(',');

    if (!selectedColumns || selectedColumns.length === 0) {
        outputDiv.textContent = "⚠️ No columns selected!";
        return;
    }

    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -param1 "${comboBoxSelect}" -columns "${selectedColumns}"`;

    exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
            outputDiv.textContent = `PowerShell Error: ${error?.message || stderr}`;
            console.error(`PowerShell error: ${error?.message || stderr}`);
            return;
        }

        try {
            let jsonData = JSON.parse(stdout);
            if (!Array.isArray(jsonData)) {
                jsonData = [jsonData];
            }

            populateTable(jsonData);
        } catch (e) {
            outputDiv.textContent = `Error parsing JSON: ${e.message}`;
            console.error(`JSON parse error: ${e.message}`);
        }
    });
}


// Build table from JSON data
function populateTable(data) {
    const tableHead = document.querySelector('#data-table thead tr');
    const tableBody = document.querySelector('#data-table tbody');
    const selectedColumns = Array.from(document.querySelectorAll('#columns-area input:checked'))
                                 .map(cb => cb.value.trim());

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // Create headers
    selectedColumns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        tableHead.appendChild(th);
    });

    // Create rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        selectedColumns.forEach(cell => {
            const td = document.createElement('td');
            const value = row[cell];

            td.textContent = Array.isArray(value)
                ? value.join(', ')
                : (typeof value === 'object' && value !== null)
                    ? JSON.stringify(value)
                    : value ?? '';

            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}
document.getElementById("explain-data-btn").addEventListener("click", () => {
    const llamaOutput = document.getElementById("llama-response");

    // Extract table data
    const rows = Array.from(document.querySelectorAll("#data-table tbody tr")).map(tr => {
        return Array.from(tr.children).map(td => td.textContent.trim()).join(" | ");
    });

    if (rows.length === 0) {
        llamaOutput.textContent = "⚠️ No data available to summarize.";
        return;
    }

    // Prepare prompt
    const promptText = `You are an expert in hardware device identification. Here is a device or devices - ${rows.slice(0, 10).join(',')} Based on this information, provide a concise explanation (2-3 sentences) describing what this device is and its likely function.`;

    // Call Python script
    const pythonPath = path.join(__dirname, 'llama', 'Scripts', 'python.exe');
    const pythonScript = path.join(__dirname, 'llama_analyze.py');
    const command = `"${pythonPath}" "${pythonScript}" "${promptText.replace(/"/g, '\\"')}"`;

    llamaOutput.textContent = "⏳ LLaMA is thinking...";

    exec(command, { maxBuffer: 1024 * 1000 }, (err, stdout, stderr) => {
        if (err || stderr) {
            llamaOutput.textContent = `❌ Error: ${err?.message || stderr}`;
            console.error('Python error:', err?.message || stderr);
            return;
        }

        llamaOutput.textContent = stdout.trim() || "No response generated.";
    });
});
document.getElementById('submit-llama-query-btn').addEventListener('click', async () => {
            const comboBox = document.getElementById('status-dropdown');
            const selectedOption = comboBox.value;
            const output = document.getElementById('llama-response');
            const scriptPath = path.join(__dirname, 'static', 'Services.ps1');
            const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
            const llamaOutput = document.getElementById("llama-response");
        exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(`PowerShell error: ${error?.message || stderr}`);
                return;
            }

            let jsonData;
            try {
                jsonData = JSON.parse(stdout);
                if (!Array.isArray(jsonData)) {
                    jsonData = [jsonData];
                }
            } catch (e) {
                console.error(`JSON parse error: ${e.message}`);
                output.textContent = `JSON parse error: ${e.message}`;
                return;
            }

            let promptText = '';
            promptText = jsonData
                .map(row => {
                    const service = row['Service'] || row['Name'] || Object.values(row)[0];
                    const status = row['Status'] || Object.values(row)[1];
                    if (service && status) {
                        return `${service} is ${status}`;
                    }
                    return '';
                })
                .filter(Boolean)
                .join(', ') + `. What services are ${selectedOption}?`;
            output.textContent = 'Running llama query...';

            // Call Python script in the same way as above
            const pythonPath = path.join(__dirname, 'llama', 'Scripts', 'python.exe');
            const pythonScript = path.join(__dirname, 'llama_analyze.py');
            const command_py = `"${pythonPath}" "${pythonScript}" "${promptText.replace(/"/g, '\\"')}"`;

            output.textContent = "⏳ LLaMA is thinking...";

            exec(command_py, { maxBuffer: 1024 * 1000 }, (err, stdout, stderr) => {
                if (err || stderr) {
                    output.textContent = `❌ Error: ${err?.message || stderr}`;
                    console.error('Python error:', err?.message || stderr);
                    return;
                }

                output.textContent = stdout.trim() || "No response generated.";
            });
        });
});
