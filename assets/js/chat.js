//TODO:
// iterate over follows list.

function onInit() {
    if (!window.localStorage) {
        alert('No support for localStorage');
    }

    document.getElementById("mainAccount").value = localStorage.getItem("mainAccount");
    document.getElementById("accessToken").value = localStorage.getItem("accessToken");
    document.getElementById("clientId").value = localStorage.getItem("clientId");
    document.getElementById("usersBanList").value = localStorage.getItem("usersBanList");
    document.getElementById("customMessage").value = localStorage.getItem("customMessage");
    document.getElementById("usersAllowList").value = localStorage.getItem("usersAllowList");
    localStorage.setItem("chatUserId", ''); //default on load
    localStorage.setItem("botUser", ''); //default on load
    localStorage.setItem("recentFollower", ''); //default on load

    //Checkboxes
    document.getElementById("check_del_msg").checked = localStorage.getItem("check_del_msg") === 'true';

    document.getElementById("check_timeout_user").checked = localStorage.getItem("check_timeout_user") === 'true';

    document.getElementById("check_ban_user").checked = localStorage.getItem("check_ban_user") === 'true';

    document.getElementById("check_twitchbots").checked = localStorage.getItem("check_twitchbots") === 'true';

    document.getElementById("check_twitchbots").addEventListener("click", function (e) {
        document.getElementById("usersAllowList").disabled = !document.getElementById("check_twitchbots").checked;
    });

    document.getElementById("usersAllowList").disabled = localStorage.getItem("check_twitchbots") !== 'true';

}

document.getElementById("start_button").addEventListener("click", function (e) {
    this.disabled = "true";
    document.getElementById("stop_button").disabled = "";

    let mainAccount = document.getElementById("mainAccount").value;
    let accessToken = document.getElementById("accessToken").value;
    let clientId = document.getElementById("clientId").value;
    let usersBanList = document.getElementById("usersBanList").value;
    let customMessage = document.getElementById("customMessage").value;
    let usersAllowList = document.getElementById("usersAllowList").value;
    localStorage.setItem("mainAccount", mainAccount);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("clientId", clientId);
    localStorage.setItem("usersBanList", usersBanList);
    localStorage.setItem("customMessage", customMessage);
    localStorage.setItem("usersAllowList", usersAllowList);

    //Checkboxes SET
    let check_ban_user = document.getElementById("check_ban_user").checked;
    let check_timeout_user = document.getElementById("check_timeout_user").checked;
    let check_del_msg = document.getElementById("check_del_msg").checked;
    let check_twitchbots = document.getElementById("check_twitchbots").checked;
    localStorage.setItem("check_ban_user", check_ban_user);
    localStorage.setItem("check_timeout_user", check_timeout_user);
    localStorage.setItem("check_del_msg", check_del_msg);
    localStorage.setItem("check_twitchbots", check_twitchbots);

    let inputs = document.getElementsByTagName('input');

    for (i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }

    let selects = document.getElementsByTagName('select');

    for (i = 0; i < selects.length; i++) {
        selects[i].disabled = true;
    }

    let textarea = document.getElementsByTagName('textarea');

    for (i = 0; i < textarea.length; i++) {
        textarea[i].disabled = true;
    }

    //check if can get localStorage item
    let authtokens = localStorage.getItem("accessToken");
    //if not, then redirect and try again.
    if (!authtokens) {
        $(location).attr("href", "/");
    }

    startChat(localStorage.getItem("mainAccount"), localStorage.getItem("accessToken"), localStorage.getItem("clientId"), localStorage.getItem("usersBanList"), localStorage.getItem("usersAllowList"));
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
    if (confirm("This will clear the localStorage. You will need to re-enter data.")) {
        removeLocalStorage();
    } else {
        return false;
    }
}, false);

function startChat(mainAccount, accessToken, clientId, usersBanList, usersAllowList) {

    //Twitch API: user info: user_id
    let getInfo = function (username, follower = false) {
        let urlU = "https://api.twitch.tv/helix/users?login=" + username + "";
        let xhrU = new XMLHttpRequest();
        xhrU.open("GET", urlU);
        xhrU.setRequestHeader("Authorization", "Bearer " + accessToken + "");
        xhrU.setRequestHeader("Client-Id", clientId);
        xhrU.onreadystatechange = function () {
            if (xhrU.readyState === 4) {
                let dataU = JSON.parse(xhrU.responseText);
                let userId = `${dataU.data[0]['id']}`;
                if (username === mainAccount) {
                    localStorage.setItem("userId", userId);
                }
                localStorage.setItem("chatUserId", userId);
                if (follower) {
                    localStorage.setItem("followerUserId", userId);
                }
                return userId;
            } else {
                return false;
            }

        };
        xhrU.send();
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
                if (follows !== localStorage.getItem("recentFollower")) {
                    localStorage.setItem("recentFollower", follows);
                    verifyFollow(localStorage.getItem("recentFollower"));
                }
                //localStorage.setItem("recentFollow", follows);
                //document.getElementById("recentFollows").innerHTML = '<li class="list-group-item">' + follows + '</li>';
                return follows;
            } else {
                return false;
            }
        };
        xhrF.send();
    };

    let verifyFollow = function (follower) {
        usersAllowList = localStorage.getItem("usersAllowList");
        usersAllowList = usersAllowList.replace(/\s/g, '');
        usersAllowList = usersAllowList.toLowerCase();
        let allowListArr = usersAllowList.split(',');
        allowListArr = allowListArr.filter(Boolean);
        getInfo(follower);
        getKnownBots(localStorage.getItem("chatUserId"), true);
        if (!allowListArr.includes(localStorage.getItem("botUser")) && localStorage.getItem("botUser")) {
            document.getElementById("recentFollows").innerHTML = '<li class="list-group-item">' + localStorage.getItem("botUser") + '</li>';
        }
    }

    //Twitchbots.info: known bots database api
    let getKnownBots = function (chatuser_id) {
        let urlG = "https://api.twitchbots.info/v2/bot/" + chatuser_id + "";
        let xhrG = new XMLHttpRequest();
        xhrG.open("GET", urlG);
        xhrG.onreadystatechange = function () {
            if (xhrG.readyState === 4) {
                let dataG = JSON.parse(xhrG.responseText);
                let botUsername = dataG.username;

                if (botUsername) {
                    localStorage.setItem("botUser", botUsername);
                }

                return botUsername;
            } else {
                return false;
            }
        };
        xhrG.send();
    };

    //TMI.js Chat
    usersBanList = usersBanList.replace(/\s/g, '');
    usersBanList = usersBanList.toLowerCase();
    let usersBanListArr = usersBanList.split(',');
    usersBanListArr = usersBanListArr.filter(Boolean);

    usersAllowList = usersAllowList.replace(/\s/g, '');
    usersAllowList = usersAllowList.toLowerCase();
    let allowListArr = usersAllowList.split(',');
    allowListArr = allowListArr.filter(Boolean);

    //Run the Twitch API functions
    getInfo(mainAccount);
    setInterval(getFollows, 20000);//20secs
    setInterval(verifyFollow, 30000);//30secs

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

        usersBanListArr.forEach(usersList);

        function usersList(item, index) {

            let isBot = false;

            if (localStorage.getItem("check_twitchbots") === 'true') {
                getInfo(chatname); //0311devildog7252
                let chatUserId = localStorage.getItem("chatUserId"); // set userid

                getKnownBots(chatUserId); //check if user exists on twitchbots.info
                let botUser = localStorage.getItem("botUser"); //set bot username

                if (!allowListArr.includes(botUser) && botUser !== '') {
                    isBot = true;
                }
            }

            if (chatname.startsWith(item) || isBot) {
                let currentDate = new Date();
                let time = currentDate.getHours() + ":" + (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes();

                if (localStorage.getItem("check_ban_user") === 'true') {
                    client.ban(channel, chatname, ""); //ban user
                }
                if (localStorage.getItem("check_timeout_user") === 'true') {
                    client.timeout(channel, chatname, 300, ""); //timeout user
                }
                if (localStorage.getItem("check_del_msg") === 'true') {
                    client.deletemessage(channel, tags.id); //delete message
                }
                if (localStorage.getItem("customMessage")) {
                    client.say(channel, localStorage.getItem("customMessage") + ' -> @' + chatname);
                }

                console.log = function (message) {
                    document.getElementById('status').innerHTML += '<li class="list-group-item">' + message + '</li>';
                };
            }
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