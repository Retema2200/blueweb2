// TEST2.js
document.getElementById('testNotifyButton').addEventListener('click', function() {
    doPost();
});

function doPost() {
    fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer mTsui2ca2pCXENM5Y7sbtBOFT4T9VbYgcxnWk6zJhwL',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'message': '測試一下！'
        })
    })
    .then(response => {
        if (response.ok) {
            alert('通知已發送！');
        } else {
            alert('發送失敗！');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('發生錯誤！');
    });
}
