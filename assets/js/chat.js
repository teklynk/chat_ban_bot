//TODO:
// iterate over ban list.
// options to timeout, block, ban, deletemessages - check boxes
// option to block users
// Get a list of currently banned users (top 20), auto-ban if a new follow matches a name in the list,
// Get a list of blocked users
// Custom message to display in chat after someone from the list has been banned.

function onInit() {
    if (!window.localStorage) {
        alert('No support for localStorage');
    }

    document.getElementById("mainAccount").value = localStorage.getItem("mainAccount");
    document.getElementById("accessToken").value = localStorage.getItem("accessToken");
    document.getElementById("clientId").value = localStorage.getItem("clientId");
    document.getElementById("usersBanList").value = localStorage.getItem("usersBanList");

    console.log = function (message) {
        document.getElementById('status').innerHTML += '<li class="list-group-item">' + message + '</li>';
    };
}

document.getElementById("start_button").addEventListener("click", function (e) {
    this.disabled = "true";
    document.getElementById("stop_button").disabled = "";

    let mainAccount = document.getElementById("mainAccount").value;
    let accessToken = document.getElementById("accessToken").value;
    let clientId = document.getElementById("clientId").value;
    let usersBanList = document.getElementById("usersBanList").value;
    localStorage.setItem("mainAccount", mainAccount);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("clientId", clientId);
    localStorage.setItem("usersBanList", usersBanList);

    document.getElementById('removestorage_button').disabled = "true";

    let inputs = document.getElementsByTagName('input');

    for (i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }

    let selects = document.getElementsByTagName('select');

    for (i = 0; i < selects.length; i++) {
        selects[i].disabled = true;
    }

    startChat(localStorage.getItem("mainAccount"), localStorage.getItem("accessToken"), localStorage.getItem("clientId"), localStorage.getItem("usersBanList"));
}, false);

document.getElementById("stop_button").addEventListener("click", function (e) {
    this.disabled = "true";
    reload();
}, false);

document.getElementById("show_token").addEventListener("click", function (e) {
    if (document.getElementById("show_token").innerHTML === "hide") {
        document.getElementById("show_token").innerHTML = "show";
        document.getElementById("accessToken").setAttribute('type', 'password');
    } else {
        document.getElementById("show_token").innerHTML = "hide";
        document.getElementById("accessToken").setAttribute('type', 'text');
    }
}, false);

document.getElementById("show_clientid").addEventListener("click", function (e) {
    if (document.getElementById("show_clientid").innerHTML === "hide") {
        document.getElementById("show_clientid").innerHTML = "show";
        document.getElementById("clientId").setAttribute('type', 'password');
    } else {
        document.getElementById("show_clientid").innerHTML = "hide";
        document.getElementById("clientId").setAttribute('type', 'text');
    }
}, false);

document.getElementById("removestorage_button").addEventListener("click", function (e) {
    this.disabled = "true";
    removeLocalStorage();
}, false);

function startChat(mainAccount, accessToken, clientId, usersBanList) {

    let getInfo = function (account= null) {
        //Twitch API: user info: user_id
        if (!account) {
            account = mainAccount;
        }
        let urlU = "https://api.twitch.tv/helix/users?login=" + account + "";
        let xhrU = new XMLHttpRequest();
        xhrU.open("GET", urlU);
        xhrU.setRequestHeader("Authorization", "Bearer " + accessToken + "");
        xhrU.setRequestHeader("Client-Id", clientId);
        xhrU.onreadystatechange = function () {
            if (xhrU.readyState === 4) {
                let dataU = JSON.parse(xhrU.responseText);
                let userId = `${dataU.data[0]['id']}`;
                localStorage.setItem("userId", userId);
            }
        };

        xhrU.send();
    };

    //Twitch API: banned users
    let getBannedUsers = function () {
        let urlB = "https://api.twitch.tv/helix/moderation/banned?broadcaster_id=" + localStorage.getItem("userId") + "";
        let xhrB = new XMLHttpRequest();
        xhrB.open("GET", urlB);
        xhrB.setRequestHeader("Authorization", "Bearer " + accessToken + "");
        xhrB.setRequestHeader("Client-Id", clientId);
        xhrB.onreadystatechange = function () {
            if (xhrB.readyState === 4) {
                let dataB = JSON.parse(xhrB.responseText);
                let banned = `${dataB.data[0]['user_name']}`;
                localStorage.setItem("bannedUsers", banned);
                document.getElementById("bannedUsers").value = '<li class="list-group-item">' + localStorage.getItem("bannedUsers") + '</li>';
            }
        };

        xhrB.send();
    };

    //Twitch API: recent follows
    let getFollows = function () {
        let urlF = "https://api.twitch.tv/helix/users/follows?first=1&to_id=" + localStorage.getItem("userId") + "";
        let xhrF = new XMLHttpRequest();
        xhrF.open("GET", urlF);
        xhrF.setRequestHeader("Authorization", "Bearer " + accessToken + "");
        xhrF.setRequestHeader("Client-Id", clientId);
        xhrF.onreadystatechange = function () {
            if (xhrF.readyState === 4) {
                let dataF = JSON.parse(xhrF.responseText);
                let follows = `${dataF.data[0]['from_name']}`;
                localStorage.setItem("recentFollows", follows);
            }
        };

        xhrF.send();
    };

    getInfo();
    setInterval(getFollows, 20000);//20secs
    setInterval(getBannedUsers, 30000);//30secs

    //TMI.js Chat
    usersBanList = usersBanList.replace(/\s/g, '');
    usersBanList = usersBanList.toLowerCase();
    let usersBanListArr = usersBanList.split(',');
    usersBanListArr = usersBanListArr.filter(Boolean);

    const client = new tmi.Client({
        options: {debug: true},
        connection: {reconnect: true},
        identity: {
            username: mainAccount,
            password: 'oauth:' + accessToken
        },
        channels: [mainAccount]
    });

    client.connect().catch(console.error);

    client.on('message', (channel, tags, message, self) => {

        if (self) return;

        let chatname = `${tags['display-name']}`;
        chatname = chatname.toLowerCase();

        if (usersBanListArr.indexOf(chatname) !== -1) {
            let currentDate = new Date();
            let time = currentDate.getHours() + ":" + (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes();
            client.timeout(channel, chatname, 300, "");
            client.deletemessage(channel, tags.id);
            client.ban(channel, chatname, "");
            client.say(channel, chatname + ' has been banned.');
        }

    });
}

function reload() {
    setTimeout("window.location.reload();", 1000);
}

function removeLocalStorage() {
    setTimeout("window.localStorage.clear();", 1000);
    reload()
}