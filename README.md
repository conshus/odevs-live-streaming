Hey. I'm Dwane ([LifeLong.dev](https://lifelong.dev)) and I like to build side projects. One of them is a site where I was streaming local developer/tech group events ([otech.events](https://otech.events)). I figured it would be great if the groups or anyone else could live stream their own events just incase I was not able to make it.

So here it is. A less complex version of my project that is easier to get up and running.

# Things you need
- [GitHub account](https://github.com/signup)
- [Netlify account](https://app.netlify.com/) (you can log in using GitHub)
- [Vonage account](https://dashboard.nexmo.com)

# Steps

### Deploy the site

- [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/conshus/starter-event-streaming)

> Take note of your deploy application's URL. ie. https://YOUR-UNIQUE-ID.netlify.app

### Create a Vonage Application
<details>
    <summary>steps</summary>

- Log into the [Vonage dashboard](https://dashboard.nexmo.com)

- Click on `Applications` in the left side menu

- Click `Create a new application` button

- Enter a name for your application

- Click `Generate public and private key`

- Save the private key somewhere you will remember. Will be needed later

- Activate `RTC (In-app voice & messaging)` by pressing the switch (Don't need to fill in Event URL)

- Activate `Video` by pressing the switch 

- In the input under `Recordings callback URL New recordings alert`, make sure it's set to `HTTP POST` and in the input box next to it, place: https://YOUR-UNIQUE-ID.netlify.app/.netlify/functions/webhooks

- Click `Generate new application` button in bottom right

- Take note of your `Application ID`, you will need it for an Environment Variable

</details>

### Get Environment Variables

- In your Netlify dashboard, go to "Site settings" -> "Environment variables"

- Click "Add a variable" and select "Import from a .env file"

- Copy and paste the following into the box next to "Contents of .env file:"
<pre>
ADMIN_PASSWORD=
GITHUB_PAT=
GUEST_PASSWORD=
HOST_PASSWORDT=
NETLIFY_PAT=
VONAGE_APP_ID=
VONAGE_PRIVATE_KEY64=

** If you will be broadcasting to other sites via RTMP, ie. YouTube, Twitch, etc, you must use this naming convention:
RTMP_SERVICE_KEY=
RTMP_SERVICE_URL=
ex:
RTMP_YOUTUBE_KEY=
RTMP_YOUTUBE_URL=

</pre>
(Leave Scopes: All scopes and Deploy contexts: All deploy contexts)

- Click "Import variables"

- Now, we need to fill in the Environment variables. In the Netlify Dashboard, click a variable to expand it. Click "Options" -> "Edit". Make sure, "Scopes: All scopes" and "Values: Same value for all deploy contexts"

- Open the same variable below to see how to get the value you will then input into the dashboard. Click "Save variable" Repeat until all Environment variables are filled in.

`ADMIN_PASSWORD` : your admin password to log into https://YOUR-UNIQUE-ID.netlify.app/admin

<details>
    <summary>GITHUB_PAT</summary>
    Here is a link to instructions on how to set up your GitHub Personal Access Token (classic): <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-personal-access-token-classic" target="_blank">https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-personal-access-token-classic</a> Note: If you set an expiration, you'll have to create another PAT.
</details>

`GUEST_PASSWORD` : your guest password to log into an event at https://YOUR-UNIQUE-ID.netlify.app/guest

`HOST_PASSWORD` : your host password to log into an event at https://YOUR-UNIQUE-ID.netlify.app/host

<details>
    <summary>NETLIFY_PAT</summary>
    Go to <a href="https://app.netlify.com/user/applications" target="_blank">https://app.netlify.com/user/applications</a> and scroll to "Personal access tokens". Click "New access token" give it a name and click "Generate token".
</details>

`VONAGE_APP_ID` : your `Application ID` for the Vonage Application you just created

`VONAGE_PRIVATE_KEY64` : this is a base64 representation of the private key you downloaded when creating the Vonage Application.
> If you don't know how to create a base64 of the private key. I added a tool in the admin dashboard. You will need to save what you have so far in the Netlify dashboard. This may cause a new deployment. Log into https://YOUR-UNIQUE-ID.netlify.app/admin and under Environment Variables, click `VONAGE_PRIVATE_KEY64`. Click `Choose File` and select the private key you downloaded earlier. The information you need will populate the text box. Click `copy to clipboard` and paste that into the value for `VONAGE_PRIVATE_KEY64` environment variable.

`RTMP_SERVICE_KEY` and `RTMP_SERVICE_URL` will come from the service you want to stream to.

### Congrats!!!

- That's it! You should be able to add events in the admin dashboard and livestream them and get recordings at the end.

# How it works

I have intentionally not add much styling to the application. I didn't want for a person to have to undo my choices just to get the application to look how they want.

## Roles

- Admin: creates/deletes events and can view/download available archives
- Host: during event can switch between scenes, select what camera is shown, share their screen, start/stop archiving, and chat with viewers. When the event is over, they will get a link to download the archive.
- Guest: during event can share their screen and chat with viewers.
- Viewer: can watch the event and chat with host, guest and other viewers.


## File structure

```text
/
├── netlify/functions (all the Netlify server functions for things like generating credentials)
├── public/
│   ├── favicon.svg
│   ├── favicon.ico
├── src/
│   ├── components/
│   │   └── Card.astro (Not used in app, but I left if you'd like to see an example )
│   ├── layouts/
│   │   └── Layout.astro (wrapper around all the individual pages)
│   └── pages/
│       ├── ec/
│       │   └── [timeInMs].astro (Experience Composer uses this page record the event and broadcast)
│       ├── guest/
│       │   ├── [timeInMs].astro (guest dashboard for event)
│       │   ├── index.astro (list of events for guest to join)
│       ├── host/
│       │   ├── [timeInMs].astro (host dashboard for event)
│       │   ├── index.astro (list of events for host to join)
│       ├── [timeInMs].astro (event page to watch stream)
│       ├── admin.astro (admin dashboard to add/delete events, view available archives and more)
│       ├── index.astro (main page that lists events)
├── package.json
└── site-settings.json (where event data is stored)
```



# Powered with Vonage

The application communication features (video and chat) are using Vonage [Video](https://developer.vonage.com/en/video/overview) and [Conversation](https://developer.vonage.com/en/conversation/overview) APIs with the [Node SDK](https://github.com/vonage/vonage-node-sdk). On the frontend, it is using the [Video](https://developer.vonage.com/en/video/client-sdks/web/overview) and [Chat](https://developer.vonage.com/en/vonage-client-sdk/overview) JavaScript Client SDKs.

The UI is created with the [Video API](https://github.com/Vonage-Community/web_components-video_api-javascript) and [Conversation API](https://github.com/nexmo-community/clientsdk-ui-js/) Web Components.

Vonage also handles the [Broadcasting](https://developer.vonage.com/en/video/guides/broadcast/overview?source=video) to other sites and [Archiving](https://developer.vonage.com/en/video/guides/archiving/overview?source=video) the events using [Experience Composer](https://developer.vonage.com/en/video/guides/experience_composer?source=video).

# Hosted with Netlify

I like that you could deploy to [Netlify](https://netlify.com) with a click of a button and it pulls the information needed from a GitHub repo. If want to develop something for this application locally, they have some [documentation](https://docs.netlify.com/cli/local-development/).

Basically, I install the CLI. Run `netlify link` and `netlify dev`.

When I'm done, I push my changes to the GitHub repo and Netlify with deploy my changes.

# Built with Astro

[Astro](https://astro.build) is a framework that allows people to create components with Angular, React, Svelte, Vue and many more. Everything I did is using Vanilla JavaScript because I wanted everyone to be able to understand what's happening behind the scenes. Feel free to create using what you are most comfortable with. 

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
