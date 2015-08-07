angular.module('component.user', ['firebase'])
    .factory('$user', function($log, $q, $location, $timeout, $firebaseAuth, $firebaseObject) {
    var user = this;
    user.ref='https://weo.firebaseio.com';
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
        }
    };

    user.online = 0;

    $timeout(function() {
      //  if (user.user === undefined) authUser('facebook');
    }, 5000);

    user.usersRef.onAuth(function authDataCallback(authData) {
        if (authData) {
            setUser(authData);
        } else {
            $log.error('Loading for the first time.');
        }
    });
    connectedRef.on('value', function(snap) {
        if ((snap.val() === true) && (user.userConnectionsRef !== undefined)) {
            var con = user.userConnectionsRef.push(true);
            con.onDisconnect().remove();
            user.userLastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
        }
    });

    user.authUser = function(authProviderName) {
        $firebaseAuth(user.usersRef).$authWithOAuthRedirect(authProviderName).then(function(authData) {
            console.dir(authData);
        }),
        function(reason) {
            $log.debug('Failed $authWithOAuthRedirect: ' + reason);
            alert(reason.toString());
        };
    }

    function setUser(authData) {
        //   	console.dir(authData);
        var name = authData.facebook.cachedUserProfile.name.replace(/\s+/g, '');
        user.userConnectionString = user.ref + '/users/' + name;
        user.userRef = new Firebase(user.userConnectionString);
        $firebaseObject(user.userRef)
            .$loaded(function(value) {
            user.user = value;
            user.user.name = name;
            user.user.profile = authData.facebook.cachedUserProfile;
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
            user.users = $firebaseObject(user.userRef);
            var count = 0;
            $timeout(function() {
                angular.forEach(user.users, function(value, key) {
                    if (value.connections !== undefined) count = count + 1;
                }, count);
                user.online = count;
            }, 1000);
        }
    }
    user.getImage = function(userName) {
        var returnImage;

        try {
            returnImage = user.users[userName].profile.picture.data.url;
        } catch (err) {
            user.getUsers();
            returnImage = '/images/default-avatar.png';
        }
        return returnImage;
    }
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