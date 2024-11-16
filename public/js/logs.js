const seenLogs = new Set();

function createLogRow(log) {
    const row = document.createElement('tr');
    row.classList.add('bg-white', 'hover:bg-gray-50');

    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${log.id}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}">
                ${log.status}
            </span>
        </td>
        <td class="px-6 py-4">${log.message}</td>
        <td class="px-6 py-4">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">${log.source}</span>
        </td>
        <td class="px-6 py-4"><strong>${new Date(log.createdAt).toLocaleTimeString()}</strong> ${new Date(log.createdAt).toLocaleDateString()}</td>
    `;
    return row;
}

function getStatusColor(status) {
    switch (status) {
        case 'Error':
            return 'bg-red-100 text-red-800';
        case 'Warning':
            return 'bg-yellow-100 text-yellow-800';
        case 'Success':
            return 'bg-green-100 text-green-800';
        case 'Info':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

async function getLogs() {
    try {
        const response = await fetch('/api/logs/');
        const logs = await response.json();
        const tbody = document.getElementById('logs-table-body');
        logs.forEach(log => {
            if (!seenLogs.has(log.id)) {
                tbody.appendChild(createLogRow(log));
                seenLogs.add(log.id);
            }
        });
    } catch (error) {
        console.error('Error getting logs : ', error);
    }
}

async function getLatestLogs() {
    console.log('Fetching latest logs...');
    try {
        const response = await fetch('/api/logs/latest/');
        const logs = await response.json();
        const tbody = document.getElementById('logs-table-body');
        logs.forEach(log => {
            if (!seenLogs.has(log.id)) {
                tbody.insertBefore(createLogRow(log), tbody.firstChild);
                seenLogs.add(log.id);
            }
        });
    } catch (error) {
        console.error('Error getting latest logs : ', error);
    }
}

getLogs();

setInterval(getLatestLogs, 2500);