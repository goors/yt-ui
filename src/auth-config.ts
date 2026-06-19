import { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: "dd6e6c34-5086-490d-8aac-5b501d6ccd8d",
        authority: "https://login.microsoftonline.com/c3bc7f33-f122-43c7-a464-20384157f793",
        redirectUri: "/"
    }
};