function isLikeFriend(posts, user) {
    if (user) {
        posts.forEach((post) => {
            post.likes.forEach((like) => {
                like.isPersonal = false;
                like.isFriend = false;
                like.sentReq = false;
                like.awaitingReq = false;
                if (like.sent_requests.filter((request) => request.equals(user._id)).length > 0) {
                    like.awaitingReq = like.username;
                }

                if (like.username == user.username) {
                    like.isPersonal = true;
                }
                if (user.friends.includes(like._id)) {
                    like.isFriend = true;
                }
                like.sentReq = user.sent_requests.filter((request) => request.equals(like._id)).length > 0;
            });
        });
    }
}

module.exports = isLikeFriend;
