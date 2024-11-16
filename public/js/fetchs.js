const seenFetchs = new Set();

function createFetchRow(fetch) {
    const row = document.createElement('tr');
    row.classList.add('bg-white', 'hover:bg-gray-50');

    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${fetch.id}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMethodColor(fetch.method)}">${fetch.method}</span>
        </td>
        <td class="px-6 py-4">${fetch.url}</td>
        <td class="px-6 py-4">${fetch.data || ''}</td>
        <td class="px-6 py-4">${fetch.headers || ''}</td>
        <td class="px-6 py-4">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">${fetch.source}</span>
        </td>
        <td class="px-6 py-4"><strong>${new Date(fetch.createdAt).toLocaleTimeString()}</strong> ${new Date(fetch.createdAt).toLocaleDateString()}</td>
    `;
    return row;
}

function getMethodColor(method) {
    switch (method) {
        case 'POST':
            return 'bg-yellow-100 text-yellow-800';
        case 'GET':
            return 'bg-green-100 text-green-800';
        case 'PUT':
            return 'bg-blue-100 text-blue-800';
        case 'PATCH':
            return 'bg-purple-100 text-purple-800';
        case 'DELETE':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

async function getFetchs() {
    try {
        const response = await fetch('/api/fetchs/');
        const fetchs = await response.json();
        const tbody = document.getElementById('fetchs-table-body');
        fetchs.forEach(fetch => {
            if (!seenFetchs.has(fetch.id)) {
                tbody.appendChild(createFetchRow(fetch));
                seenFetchs.add(fetch.id);
            }
        });
    } catch (error) {
        console.error('Error getting fetchs : ', error);
    }
}

async function getLatestFetchs() {
    try {
        const response = await fetch('/api/fetchs/latest/');
        const fetchs = await response.json();
        const tbody = document.getElementById('fetchs-table-body');
        fetchs.forEach(fetch => {
            if (!seenFetchs.has(fetch.id)) {
                tbody.insertBefore(createFetchRow(fetch), tbody.firstChild);
                seenFetchs.add(fetch.id);
            }
        });
    } catch (error) {
        console.error('Error getting latest fetchs : ', error);
    }
}

getFetchs();

setInterval(getLatestFetchs, 5000);