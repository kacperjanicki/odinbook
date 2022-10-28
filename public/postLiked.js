function isPostLiked(posts, currentUser) {
    if (currentUser) {
        posts.forEach((post) => {
            post.likes.forEach((like) => {
                if (like.username == currentUser.username) {
                    post.liked = true;
                } else {
                    post.liked = false;
                }
            });
        });
    }
}
module.exports = isPostLiked;
