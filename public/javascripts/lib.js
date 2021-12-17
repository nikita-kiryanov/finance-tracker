function toggleDisplayed(id) {
    let elem = document.querySelector(id);
    elem.style.display = elem.style.display === 'none' ? '' : 'none';
}

addDelayedExpense = async () => {
    let payload = {
        name: document.getElementById('delayed-name').value,
        amount: document.getElementById('delayed-amount').value,
        category_id: document.getElementById('delayed-category').value
    };
    const location = window.location.hostname;
    const settings = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    };
    try {
        res = await fetch(`http://${location}:3000/expense/delayed/`, settings);
        const table = document.getElementById('expense-delayed');
        const row = table.insertRow(0);
        row.insertCell(0);
        row.insertCell(1).innerHTML = payload.name;
        row.insertCell(2).innerHTML = payload.amount;
        categories = document.getElementById('delayed-category');
        row.insertCell(3).innerHTML = categories[payload.category_id - 1].text;
    } catch (e) {

    }
}

addImmediateExpense = async () => {
    let payload = {
        name: document.getElementById('immediate-name').value,
        amount: document.getElementById('immediate-amount').value,
        date: document.getElementById('immediate-date').value,
        category_id: document.getElementById('immediate-category').value
    };
    const location = window.location.hostname;
    const settings = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    };
    try {
        res = await fetch(`http://${location}:3000/expense/immediate/`, settings);
        const table = document.getElementById('expense-immediate');
        const row = table.insertRow(0);
        row.insertCell(0);
        row.insertCell(1).innerHTML = payload.name;
        row.insertCell(2).innerHTML = payload.amount;
        row.insertCell(3).innerHTML = payload.date;
        categories = document.getElementById('immediate-category');
        row.insertCell(4).innerHTML = categories[payload.category_id - 1].text;
    } catch(e) {

    }
}

getDaysArray = (start, end) => {
    for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(dt.toLocaleDateString('sv-SE').split('T')[0]);
    }
    return arr;
};

parseGraphEvents = (past, future) => {
    past = JSON.parse(past);
    future = JSON.parse(future);
    let data = [];
    let balance = 0;
    for (var i = 0; i < past.length; i++) {
        let amount = past[i]['amount'];
        if (amount !== null && Number(amount) != balance)
            balance = Number(amount);
        data.push(balance);
    }
    for (var i = 0; i < future.length; i++) {
        let amount = future[i]['amount'];
        if (amount !== null)
            balance -= Number(amount);
        data.push(balance);
    }
    return data;
}

displayGraph = (data) => {
    var daylist = getDaysArray(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                               new Date(new Date().getFullYear(), new Date().getMonth() + 3, 1));
    var ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: daylist,
            datasets: [{
                label: 'Balance',
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                data: data
            }, {
                label: 'zero',
                borderColor: 'red',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                data: [...daylist].map(c => 0)
            }]
        },
        options: {
            responsive: false,
            elements: {
                point: {
                    radius: 0
                }
            },
        }
    });
}