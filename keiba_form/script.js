let raceData = [];
let totalPurchaseAmount = 0;
let totalPayoutAmount = 0;

function addData() {
    const dateInput = document.getElementById('date');
    const useToday = document.getElementById('useToday').checked;
    const rowIndex = document.getElementById('rowIndex').value;

    let date;
    if (useToday) {
        const today = new Date();
        date = today.getFullYear() + ('0' + (today.getMonth() + 1)).slice(-2) + ('0' + today.getDate()).slice(-2);
        dateInput.value = date;
    } else {
        date = dateInput.value;
    }

    const venue = document.getElementById('venue').value;
    const race = document.getElementById('race').value;
    const betType = document.getElementById('betType').value;
    const horseNumber = document.getElementById('horseNumber').value;
    const purchaseAmount = parseFloat(document.getElementById('purchaseAmount').value);
    const payoutAmount = parseFloat(document.getElementById('payoutAmount').value);

    const newRow = [date, '―', '―', venue, '―', race, betType, horseNumber, purchaseAmount, '―', '―', payoutAmount];

    if (isNaN(purchaseAmount) || isNaN(payoutAmount)) {
        alert('購入金額および払戻／返還金額は数値で入力してください。');
        return;
    }

    // 既存のデータを修正する場合
    if (rowIndex) {
        const oldRow = raceData[rowIndex];
        // 合計を再計算
        totalPurchaseAmount += (purchaseAmount - oldRow[8]);
        totalPayoutAmount += (payoutAmount - oldRow[11]);
        raceData[rowIndex] = newRow;
        updateRow(rowIndex, newRow);
    } else {
        raceData.push(newRow);
        // 合計を更新
        totalPurchaseAmount += purchaseAmount;
        totalPayoutAmount += payoutAmount;
        // データ表示用テーブルに追加
        displayData(newRow);
    }

    updateTotals();

    alert('データが追加されました');
    document.getElementById('keibaForm').reset();
    document.getElementById('rowIndex').value = '';
    document.getElementById('submitButton').textContent = 'データを追加';
}

function displayData(newRow, index = raceData.length - 1) {
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const newRowElement = tableBody.insertRow(index);

    // 収支を計算
    const profit = newRow[11] - newRow[8];

    // 回収率を計算（少数第一位まで表示）
    const returnRate = ((newRow[11] / newRow[8]) * 100).toFixed(1) + '%';

    // 表示項目を追加
    const displayRow = [newRow[3], newRow[5], newRow[6], newRow[7], newRow[8], newRow[11], profit, returnRate];
    
    displayRow.forEach((cellData, cellIndex) => {
        const cell = newRowElement.insertCell();
        cell.textContent = cellData;
        // 収支が赤字の場合、赤色で表示
        if (cellIndex === 6 && cellData < 0) {
            cell.style.color = 'red';
        }
    });

    // 編集ボタンを追加
    const editCell = newRowElement.insertCell();
    const editButton = document.createElement('button');
    editButton.textContent = '編集';
    editButton.onclick = () => editData(index);
    editCell.appendChild(editButton);
}

function updateRow(index, newRow) {
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const rowElement = tableBody.rows[index];

    // 収支を計算
    const profit = newRow[11] - newRow[8];

    // 回収率を計算（少数第一位まで表示）
    const returnRate = ((newRow[11] / newRow[8]) * 100).toFixed(1) + '%';

    // 表示項目を更新
    const displayRow = [newRow[3], newRow[5], newRow[6], newRow[7], newRow[8], newRow[11], profit, returnRate];
    
    displayRow.forEach((cellData, cellIndex) => {
        const cell = rowElement.cells[cellIndex];
        cell.textContent = cellData;
        // 収支が赤字の場合、赤色で表示
        if (cellIndex === 6 && cellData < 0) {
            cell.style.color = 'red';
        } else {
            cell.style.color = 'black';
        }
    });
}

function editData(index) {
    const data = raceData[index];
    document.getElementById('date').value = data[0];
    document.getElementById('venue').value = data[3];
    document.getElementById('race').value = data[5];
    document.getElementById('betType').value = data[6];
    document.getElementById('horseNumber').value = data[7];
    document.getElementById('purchaseAmount').value = data[8];
    document.getElementById('payoutAmount').value = data[11];
    document.getElementById('rowIndex').value = index;
    document.getElementById('submitButton').textContent = '保存';
}

function updateTotals() {
    // 合計を表示
    document.getElementById('totalPurchaseAmount').textContent = totalPurchaseAmount.toFixed(1);
    document.getElementById('totalPayoutAmount').textContent = totalPayoutAmount.toFixed(1);

    // 収支と回収率の合計を計算
    const totalProfit = totalPayoutAmount - totalPurchaseAmount;
    const totalReturnRate = ((totalPayoutAmount / totalPurchaseAmount) * 100).toFixed(1) + '%';

    // 収支と回収率の合計を表示
    const totalProfitElement = document.getElementById('totalProfit');
    totalProfitElement.textContent = totalProfit.toFixed(1);
    if (totalProfit < 0) {
        totalProfitElement.style.color = 'red';
    } else {
        totalProfitElement.style.color = 'black';
    }

    document.getElementById('totalReturnRate').textContent = totalReturnRate;
}

function downloadCSV() {
    const csvHeader = ['日付', '受付番号', '通番', '場名', '曜日', 'レース', '式別', '馬／組番', '購入金額', '的中／返還', '払戻単価', '払戻／返還金額'];
    const csvRows = [csvHeader.join(',')];

    raceData.forEach(row => {
        csvRows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n'); // BOMを追加してUTF-8エンコーディングを指定
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'race_data.csv');
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}
