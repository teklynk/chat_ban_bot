# **Twitch Chat Auto-Ban**
```
When you create a Twitch Access Token, be sure to select Custom Scope Token. 
Scroll down site and select these permissions:

chat:read
chat:edit
channel:moderate
moderation:read
user:read:blocked_users

And then scroll down and click the green "Generate Token!" button.
You should get redirected to Authorize with Twitch. 
You will then be redirected back to the Token Generator site.
You will need the ACCESS TOKEN and CLIENT ID. < save these some where just in case.

Enter the access token and client id.
Set the Source Twitch Account (your channel name)
Ban List is a comma separated list of names. These can be sourced from Reddit. You can also use names that start-with like: test,test2,tekly,hoss,hate,judge
For testing you can start out by checking the "Delete Messages" checkbox and adding a custom message. This will delete the users message and say you custom message in chat right after.

Be sure to click "Start" so that the app can start listening to Twitch chat.

You can add this as a OBS Dock to make it easier to manage:
OBS > View > Docks > Custom Browser Dock
```