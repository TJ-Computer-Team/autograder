// Mock OAuth functionality to accept all logins

async function getToken() {
    // Return a mock login URL (not used in this setup)
    return "/grade/authlogin";
}

// Mock processFunction to accept any login and return dummy user data
async function processFunction(CODE, req, res2) {
    try {
        // Simulate user data
        const user_data = {
            id: "12345",
            display_name: "Saturo Gojo",
            ion_username: "skbidi"
        };

        // Store user data in the session
        req.session.id = user_data.id;
        req.session.user_data = user_data;

        // Redirect to the profile page after login
        res2.redirect('/profile');
    } catch (error) {
        console.log('Mock Login Error:', error.message);
        res2.status(500).send('An error occurred during login');
    }
}

module.exports = {
    getToken: () => {
        return getToken();
    },
    processFunction: (CODE, req, res) => {
        return processFunction(CODE, req, res);
    }
};