function getCookie(name: string) {
    // Split the document.cookie string into individual cookies
    let cookies = document.cookie.split(';');

    // Loop through the cookies
    for (let i = 0; i < cookies.length; i++) {
        // Get the cookie and trim any leading spaces
        let cookie = cookies[i].trim();

        // Check if the cookie name matches the name we're looking for
        if (cookie.indexOf(name + '=') === 0) {
            // Return the cookie value (substring after the cookie name and equals sign)
            return cookie.substring(name.length + 1);
        }
    }
    // Return null if the cookie was not found
    return null;
}

export { getCookie }