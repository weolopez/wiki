angular.module('component.user', ['firebase'])
    .factory('$user', function($log, $q, $location, $timeout, $firebaseAuth, $firebaseObject) {
    var user = this;
    user.online = 0;
    user.ref='https://weo-wiki.firebaseio.com';
    user.editRefString = 'users';
    user.usersRef = new Firebase(user.ref);
    var connectedRef = new Firebase(user.ref + '/.info/connected');
    user.authProviders={
        facebook: {
            name:'facebook',
            imgurl:'https://www.facebook.com/images/fb_icon_325x325.png'
        },
        github: {
            name:'github',
            imgurl:'https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png'
        },
        twitter: {
            name:'twitter',
            imgurl:'https://upload.wikimedia.org/wikipedia/commons/f/f3/Twitter_icon.png'
        },
        google: {
            name:'google',
            imgurl:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Google_plus.svg/1047px-Google_plus.svg.png'
        }
    };


    $timeout(function() {
      //  if (user.user === undefined) authUser('facebook');
    }, 5000);

    user.usersRef.onAuth(function authDataCallback(authData) {
     //  console.log('onAuth:'+authData.provider);
        if (authData) {
            setUser(authData);
        } else {
            $log.error('Loading for the first time.');
        }
    });
    connectedRef.on('value', function(snap) {
     //  console.log('connectedRef:'+snap);
        if ((snap.val() === true) && (user.userConnectionsRef !== undefined)) {
            var con = user.userConnectionsRef.push(true);
            con.onDisconnect().remove();
            user.userLastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
        }
    });

    user.authUser = function(authProviderName) {
        $firebaseAuth(user.usersRef).$authWithOAuthRedirect(authProviderName).then(setUser),
        function(reason) {
            $log.debug('Failed $authWithOAuthRedirect: ' + reason);
            alert(reason.toString());
        };
    }

    function setUser(authData) {
            console.log(authData.provider);
            var name = authData[authData.provider].displayName.replace(/\s+/g, '');
            user.userConnectionString = user.ref + '/users/' + name;
            user.userRef = new Firebase(user.userConnectionString);
            $firebaseObject(user.userRef)
                .$loaded(function(value) {
                user.user = value;
                user.user.name = name;
                user.user.profileProvider = authData.provider;
                user.user.profile = authData[user.user.profileProvider];
                user.userConnectionsRef = new Firebase(user.userConnectionString + '/connections');
                user.userLastOnlineRef = new Firebase(user.userConnectionString + '/lastOnline');

                user.user.$watch(function() {
                    $timeout(function() {
                        if (user.user.location === $location.url()) return;
                        if (user.synch) $location.url(user.user.location);
                    }, 1000);
                }, 'location');
                save();
            });
      //  }
    }

    function save() {
        user.user.$save();
    }
    user.setLocation = function(location) {
        user.user.location = location;
        save();
    }

    user.setProperty = function(key, value) {
        user.user[key] = value;
        save();
    }

    user.getProperty = function(key) {
        return user.user[key];
    }

    user.setEditLocation = function(editRefString) {
        user.editLocationConnectionsRef = new Firebase(user.ref + '/' + editRefString + '/' + user.user.name + '/connections');
        user.editLocationLastOnlineRef = new Firebase(user.ref + '/' + editRefString + '/' + user.user.name + '/lastOnline');
    }

    user.getUsers = function() {
        if ( (user.users === undefined) ||
             (user.userRef !== undefined) )     {
            var usersConnectionString = user.ref + '/users';
            $firebaseObject(new Firebase(usersConnectionString))
            .$loaded(function(value) {
                user.users = value;
                var count=0;
                angular.forEach(user.users, function(value, key) {
                    if (value.connections !== undefined) count = count + 1;
                }, count);
                user.online = count;
            });
        }
    }
    user.getImage = function(userName, source) {
        var returnImage = 'img/ionic.png', loggedInImage;
        if (user.user === undefined) return returnImage;
        try {
            loggedInImage = user.user.profile.profileImageURL;
        } catch (err) {}     
        
        if (source===user.user.profileProvider) {
            if (loggedInImage !== undefined) returnImage=loggedInImage;
        }
        if (source===undefined) {
            if (loggedInImage !== undefined) returnImage=loggedInImage;
        }
        
        return returnImage;
    };
    user.getLastOnline = function(userName) {
        var returnDate;

        try {
            var date = new Date(user.users[userName].lastOnline);
            returnDate = date.toJSON();
        } catch (err) {
            returnDate = 'UNKNOWN';
        }
        if (user.users[userName].connections !== undefined) returnDate = 'Is currently online.';
        return returnDate;
    }
    user.getUsers();
    return this;
});