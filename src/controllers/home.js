exports.homeView = async (req, res) => {  
    // const { user } = req.user;
    // const { username } = user;
    const username = 'admin';
    
    return res.render('home', { user: { 
        username,
    }});
};