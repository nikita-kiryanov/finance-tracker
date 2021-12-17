function toggleDisplayed(id) {
    let elem = document.querySelector(id);
    elem.style.display = elem.style.display === 'none' ? '' : 'none';
}

insertHTMLTableRow = (tableId, cellValues) => {
    const table = document.getElementById(tableId);
    const row = table.insertRow(0);
    for (var i = 0; i < cellValues.length; i++) {
        row.insertCell(i).innerHTML = cellValues[i];
    }
}

submitNewExpense = (func, formId) => {
    const form = document.getElementById(formId);
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    func();
}

addDelayedExpense = async () => {
    let delayedName = document.getElementById('delayed-name');
    let delayedAmount = document.getElementById('delayed-amount');
    let delayedCategory = document.getElementById('delayed-category');
    let delayedPayments = document.getElementById('delayed-payments');
    let payments = parseInt(delayedPayments.value);
    let payloads = [];
    let columns = [];
    const now = new Date();
    columns = ['name', 'amount', 'category_id', 'date', 'payments_text'];
    for (var i = 0; i < payments; i++) {
        paymentDate = new Date(now.getFullYear(), now.getMonth() + 1 + i, 2);
        payloads.push({
            name: delayedName.value,
            amount: parseFloat(delayedAmount.value) / payments,
            category_id: delayedCategory.value,
            date: paymentDate.toLocaleDateString('sv-SE').split('T')[0],
            payments_text: '' + (i + 1) + '/' + payments
        });
    }
    const location = window.location.hostname;
    const settings = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({payloads, columns}),
    };
    try {
        res = await fetch(`http://${location}:3000/expense/delayed/`, settings);
        const categories = document.getElementById('delayed-category');
        const selectedCategory = categories[payloads[0].category_id - 1];
        insertHTMLTableRow('expense-delayed', [
            '', payloads[0].name, payloads[0].amount, selectedCategory.text, '' + 1 + '/' + payments
        ]);
        delayedName.value = null;
        delayedAmount.value = null;
        delayedCategory.value = 1;
        delayedPayments.value = 1;
    } catch (e) {

    }
}

addImmediateExpense = async () => {
    let immediateName = document.getElementById('immediate-name');
    let immediateAmount = document.getElementById('immediate-amount');
    let immediateDate = document.getElementById('immediate-date');
    let immediateCategory = document.getElementById('immediate-category');
    let payload = {
        name: immediateName.value,
        amount: immediateAmount.value,
        date: immediateDate.value,
        category_id: immediateCategory.value
    };
    const location = window.location.hostname;
    const settings = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    };
    try {
        res = await fetch(`http://${location}:3000/expense/immediate/`, settings);
        const categories = document.getElementById('immediate-category');
        const selectedCategory = categories[payload.category_id - 1];
        insertHTMLTableRow('expense-immediate', [
            '', payload.name, payload.amount, payload.date, selectedCategory.text
        ]);
        immediateName.value = null;
        immediateAmount.value = null;
        immediateDate.value = null;
        immediateCategory.value = 1;
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
    if (future[0]['amount'] !== null)
        data[past.length - 1] -= future[0]['amount'];
    for (var i = 1; i < future.length; i++) {
        let amount = future[i]['amount'];
        if (amount !== null)
            balance -= Number(amount);
        data.push(balance);
    }
    return data;
}

let originalLineDraw = Chart.controllers.line.prototype.draw;
Object.assign(Chart.controllers.line.prototype, {
    draw: function () {
        originalLineDraw.apply(this, arguments);

        var chart = this.chart;
        var ctx = chart.ctx;

        const now = new Date();
        const label = now.toLocaleDateString('sv-SE').split('T')[0];

        var index = chart.config.data.labels.findIndex(e => e == label);
        var xaxis = chart.scales['x'];
        var yaxis = chart.scales['y'];

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xaxis.getPixelForValue(index), yaxis.top);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 3;
        ctx.lineTo(xaxis.getPixelForValue(index), yaxis.bottom);
        ctx.stroke();
        ctx.restore();
    }
});

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
