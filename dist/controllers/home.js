exports.homeView = async (req, res) => {  
    const { user } = req.user;
    const { username } = user;
    
    return res.render('home', { user: { 
        username,
    }});
};