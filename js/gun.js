export function initGunDB(app) {
    const gun = Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun']
    });

    app.gun = gun;
    
    gun.get('users').map().on((user, id) => {
        if (user && id === app.state.currentUser?.id) {
            app.state.currentUser = user;
        }
    });
    
    app.methods = {
        saveUser: (userData) => {
            return new Promise((resolve) => {
                gun.get('users').get(userData.id).put(userData, ack => {
                    if (!ack.err) {
                        localStorage.setItem('bunnyChatUser', JSON.stringify(userData));
                        resolve(userData);
                    }
                });
            });
        }
    };
}
