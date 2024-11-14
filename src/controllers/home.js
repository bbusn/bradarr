exports.homeView = async (req, res) => {  
    // const { user } = req.user;
    // const { username } = user;
    const username = 'admin';
    
    res.render('home', { user: { 
        username,
    }});
};