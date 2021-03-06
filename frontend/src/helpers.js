import {renderFeed, checkLoadMore, makeHome} from './main.js';
import API from './api.js';

/* returns an empty array of size max */
export const range = (max) => Array(max).fill(null);

/* returns a randomInteger */
export const randomInteger = (max = 1) => Math.floor(Math.random()*max);

/* returns a randomHexString */
const randomHex = () => randomInteger(256).toString(16);

/* returns a randomColor */
export const randomColor = () => '#'+range(3).map(randomHex).join('');

/**
 * You don't have to use this but it may or may not simplify element creation
 * 
 * @param {string}  tag     The HTML element desired
 * @param {any}     data    Any textContent, data associated with the element
 * @param {object}  options Any further HTML attributes specified
 */
export function createElement(tag, data, options = {}) {
    const el = document.createElement(tag);
    el.textContent = data;
   
    // Sets the attributes in the options object to the element
    return Object.entries(options).reduce(
        (element, [field, value]) => {
            element.setAttribute(field, value);
            return element;
        }, el);
}

// Function to create a login form
export function createLoginForm() {

    const section = createElement('section', null, {class : 'login', id : 'login'});
    section.appendChild(createElement('h4', 'Login form', { class: 'login-title' }));
    const myForm = createElement('div', null, {class : 'form'});

    myForm.appendChild(createElement('label', 'Username:', {class : 'labels'}));
    myForm.appendChild(createElement('br', null));
    myForm.appendChild(createElement('input', null, {type: 'text', placeholder: 'Enter username here', required : null, id: 'name'} ));
    myForm.appendChild(createElement('br', null));
    myForm.appendChild(createElement('label', 'Password:', {class : 'labels'}));
    myForm.appendChild(createElement('br', null));
    myForm.appendChild(createElement('input', null, {type: 'text', placeholder: 'Enter password here', required : null, id: 'pass'} ));
    myForm.appendChild(createElement('br', null));
    myForm.appendChild(createElement('button', 'Login', {type: 'submit', id: 'submit'}));
    const register = createElement('a', 'Not yet a member?', {id : 'register-link', href : '#register'});
    register.addEventListener('click', createRegisterForm);
    myForm.appendChild(register);
    section.appendChild(myForm);
    return section;
}

// Function to create a registration form
export function createRegisterForm() {
    const main = document.getElementById('large-feed');
    if (document.getElementById('login') != null) {
        main.removeChild(document.getElementById('login'));
    }
    var current = window.location.href;
    window.location.href = current.replace(/#(.*)$/, '') + '#' + 'register';
    const section = createElement('section', null, {class : 'register', id : 'register'});
    section.appendChild(createElement('h4', 'Registration form', { class: 'title' }));
    const myForm = createElement('div', null, {class : 'form'});
    myForm.appendChild(createElement('label', 'Username:', {class : 'labels'}));
    myForm.appendChild(createElement('br', null));
    var uname = createElement('input', null, {type: 'text', placeholder: 'Enter username here', id: 'name'});
    uname.required = true;
    myForm.appendChild(uname);
    myForm.appendChild(createElement('br', null));
    myForm.appendChild(createElement('label', 'Name:', {class : 'labels'}));
    myForm.appendChild(createElement('br', null));
    var name = createElement('input', null, {type: 'text', placeholder: 'Enter name here', id: 'real_name'} );
    name.required = true;
    myForm.appendChild(name);
    myForm.appendChild(createElement('br', null));
    myForm.appendChild(createElement('label', 'Password:', {class : 'labels'}));
    myForm.appendChild(createElement('br', null));
    var password = createElement('input', null, {type: 'text', placeholder: 'Enter password here', id : 'pass'});
    password.required = true;
    myForm.appendChild(password);
    myForm.appendChild(createElement('br', null));
    myForm.appendChild(createElement('label', 'Email:', {class : 'labels'}));
    myForm.appendChild(createElement('br', null));
    var email = createElement('input', null, {type: 'text', placeholder: 'Enter email here', id : 'email'});
    email.required = true;
    myForm.appendChild(email);
    myForm.appendChild(createElement('br', null));
    const button = createElement('button', 'Register', {type: 'submit', id: 'register-button'});
    button.addEventListener('click', register);
    myForm.appendChild(button);
    const link = createElement('a', 'Back to login', {id : 'login-link', href : '/'});
    //link.addEventListener('click', createLogin);
    myForm.appendChild(link);
    section.appendChild(myForm);
    main.appendChild(section);

}



// Function to register the user once they press register on register form
function register(e) {

    // First, we get all the fields
    var username = document.getElementById('name').value;
    var name = document.getElementById('real_name').value;
    var password = document.getElementById('pass').value;
    var email = document.getElementById('email').value;

    // Now, for some error checking, first check if all fields are filled up
    if (username == "" || name == "" || password == "" || email == "") {

        // Got this from stack overflow, to delete all error classes
        var paras = document.getElementsByClassName('error');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);

        if (!document.getElementById('register-empty-error')) {
            const section = createElement('div', 'Please fill in all fields', {class : 'error', id : 'register-empty-error'});
            const form = document.getElementById('register');
            form.appendChild(section);
            return;
        }
    }

    // Next, check if the email is valid
	const pattern = /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z0-9A-Z]+/i;
	if (!(pattern.exec(email))) {
        var paras = document.getElementsByClassName('error');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);

        if (!document.getElementById('register-email-error')) {
            const section = createElement('div', 'Please enter a valid email (A@A.A)', {class : 'error', id : 'register-email-error'});
            const form = document.getElementById('register');
            form.appendChild(section);
            return;
        }
    }

    // Remove all errors if any
    var paras = document.getElementsByClassName('error');
    while(paras[0]) 
        paras[0].parentNode.removeChild(paras[0]);

    // Now, we are going to make our user object
    const user = {};
    user.username = username;
    user.password = password;
    user.email = email;
    user.name = name;

    // Then, we make a call to the API
    const api = new API();
    api.register(user).then(json => {
        const tok = json.token;
        if (tok == undefined) {
            var paras = document.getElementsByClassName('error');
            while(paras[0]) 
                paras[0].parentNode.removeChild(paras[0]);

            if (!document.getElementById('register-username-error')) {
                const section = createElement('div', 'Username already taken', {class : 'error', id : 'register-username-error'});
                const form = document.getElementById('register');
                form.appendChild(section);
                return;
            }
        }
        window.localStorage.setItem('status', 'loggedIn');
        window.localStorage.setItem('cur_user', username);
        renderFeed(tok);
        console.log("WE HERE");

    });


}
/**
 * Given a post, return a tile with the relevant data
 * @param   {object}        post 
 * @returns {HTMLElement}
 */
export function createPostTile(post, auth_token) {
    const section = createElement('section', null, { class: 'post', id : `post-${post.id}` });
    const parentDiv = createElement('span', null, {class : 'post-title'});
    const userName = createElement('h2', post.meta.author, {id : `post-${post.id}-username`, style : "float:left"});
    userName.addEventListener('click', () => showPublicProfile(auth_token, post.meta.author));
    parentDiv.appendChild(userName);

    if (checkStore('cur_user') == post.meta.author) {
        const contextDiv = createElement('span', null, {class: 'dropdown'});
        const contextButton = createElement('span', null, {id : 'dropdownMenuButton', 'data-toggle': 'dropdown','aria-haspopup':"true" , 'aria-expanded' : 'false'});
        contextDiv.appendChild(contextButton);
        const contextMenu = createElement('div', null, {class : 'dropdown-menu', 'aria-labelledby': 'dropdownMenuButton'});
        const updateOption = createElement('a', 'Update', {class : 'dropdown-item', href : '#'});
        updateOption.addEventListener('click', () => updatePostModal(auth_token, post.id));
        const deleteOption = createElement('a', 'Delete', {class : 'dropdown-item', href : '#' });
        deleteOption.addEventListener('click', () => deletePost(auth_token, post.id));
        contextMenu.appendChild(updateOption);
        contextMenu.appendChild(deleteOption);
        contextDiv.appendChild(contextMenu);
        parentDiv.appendChild(contextDiv);
    }
    section.appendChild(parentDiv);
    const img = createElement('img', null, 
    { src: 'data:image/png;base64,' + post.src, alt: post.meta.description_text, class: 'post-image' });
    img.addEventListener('click', () => showPublicProfile(auth_token, post.meta.author));
    section.appendChild(img);
    const heart = createElement('i', null, {class :'glyphicon glyphicon-heart'});
    const main_heart = createElement('a', null, {class : 'heart'});
    main_heart.appendChild(heart);
    main_heart.addEventListener('click', (event) => like(event, auth_token, post));
    section.appendChild(main_heart);
    section.appendChild(createElement('br', null, {}));
    const likesLink = createElement('a', post.meta.likes.length + ' likes', {class : 'likes', href: '#likesModal', id : `${post.id}`});
    likesLink.addEventListener('click', (event) => showLikes(event, post, auth_token));
    section.appendChild(likesLink);
    const span = document.getElementsByClassName("close")[0];
    span.addEventListener('click', closeLikes);
    section.appendChild(createElement('p', post.meta.description_text, {class : 'post-description'}));

    section.appendChild(createElement('time', 'Posted on ' + timeConverter(post.meta.published), {class :'post-time', datetime : post.meta.published }));
    section.appendChild(createElement('br', null, {}));
    const commentsLink = createElement('a', post.comments.length + ' comments', {class : 'post-comments', href: '#postsModal', id:  `${post.id}-comment`});
    commentsLink.addEventListener('click', (event) => showComments(event, post, auth_token));
    section.appendChild(commentsLink);
    const span2 = document.getElementsByClassName("close")[1];
    span2.addEventListener('click', closeComments);
    return section;
}

/**
 * Given the id, deletes the post
 * @param   {string} auth_token
 * @param   {number} id
 */
function deletePost(auth_token, id) {
    const api = new API();
    const promise = api.delete_post(auth_token, id);
    promise.then(response => {
        if (response.status !== 200) {
            console.log('Delete failed');
        }
        const feed = document.getElementById('large-feed');
        const deletedPost = document.getElementById(`post-${id}`);
        const author = document.getElementById(`post-${id}-username`).innerText;
        feed.removeChild(deletedPost);
        const post_num = document.getElementById('num-posts');
        console.log(author);
        api.getUserByUsername(auth_token, author).then((user => {
            console.log(user);
            post_num.innerText = `${user.posts.length} posts`;
        }))

    })
}

/**
 * Given the id, creates the updating post modal
 * @param   {string} auth_token
 * @param   {number} id
 */
function updatePostModal(auth_token, id) {

    // Create necessary html
    const modal = document.getElementById('updatePostsModal');
    const postsBody = document.getElementById("update-posts-body");
    var postLink = document.getElementById('update-post-link');
    if (postLink == null) {
        postLink = createElement('input', 'Choose your image', {type :'file', id : 'update-post-link'});
        postLink.required = true;
        postsBody.appendChild(postLink);
    } 
    const postFooter = document.getElementById('update-post-button');

    // Add an event to the update button
    postFooter.addEventListener('click', (event) => {
        const desc = document.getElementById('update-post-desc');
        // Remove all errors if any
        var paras = document.getElementsByClassName('alert alert-danger');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);
        if (desc.value == "" && postLink.files[0] == undefined) {
            if (!document.getElementById('update-post-error')) {
                const section = createElement('div', 'Nothing to update', {class : 'alert alert-danger', id : 'update-post-error'});
                postsBody.appendChild(section);
            }
            return;
        }
        var paras = document.getElementsByClassName('alert');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);
        updateImage(id, desc.value, postLink.files[0], auth_token);
        if (!document.getElementById('update-post-success')) {
            const section = createElement('div', 'Update successful', {class : 'alert alert-success', id : 'update-post-success'});
            postsBody.appendChild(section);
        }

    });

    modal.style.display = 'block';
}

// Given an input element of type=file, updates it
function updateImage(id, desc, file, auth_token) {
    const img = {};
    const api = new API();
    if (desc !== undefined && desc !== "") {
        img.description_text = desc;
        if (file == undefined) {
            console.log(img);
            console.log(id);
            console.log(auth_token);
            api.update_post(auth_token, img, id)
            .then((response) => {
                if (response.status !== 200) {
                    console.log("failed");
                }
            })
            return;
        }
    }
    if (file !== undefined) {
        const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
        const valid = validFileTypes.find(type => type === file.type);
    
        // bad data, let's walk away
        if (!valid)
            return false;

            // if we get here we have a valid image
        const reader = new FileReader();
        reader.onload = (e) => {
            // do something with the data result
            const dataURL = e.target.result;
            console.log(dataURL);
            var pattern;
            if (file.type == 'image/jpeg') {
                pattern = /data:image\/jpeg;base64,/i;
            } else if (file.type == 'image/png') {
                pattern = /data:image\/png;base64,/i;        
            } else {
                pattern = /data:image\/jpg;base64,/i;             
            }
            img.src = dataURL.replace(pattern, '');
            console.log("Here in updateImage");
            const promise = api.update_post(auth_token, img, id);
            if (promise.status !== 200) {
                console.log("failed");
            }
        };

        // this returns a base64 image
        reader.readAsDataURL(file);
    }
    
}

// Function to show the likes modal, given a post and authorization token
function showLikes(e, post, auth_token) {
    const modal = document.getElementById('likesModal');
    const heading = document.getElementById('likesTitle');
    heading.innerText = "Likes";
    const likesBody = document.getElementById("likes-body");
    likesBody.innerText = "";
    const listLikes = createElement('ul', null, {class: 'list-group list-group-flush'});
    console.log(e.target);
    console.log(post);
    const api = new API();

    // Gets information about post
    api.get_post(auth_token, post.id)
    .then((json) => {
        for (var user in json.meta.likes) {
            console.log(json.meta.likes[user]);

            // Gets information about each user and adds that to the list of users who liked the post
            api.getUser(auth_token,json.meta.likes[user]).then(json2 => {
                const like_user = createElement('li', json2.username, {class : 'list-group-item'} );
                listLikes.appendChild(like_user);
            });
        }
        likesBody.appendChild(listLikes);
    })

    modal.style.display = 'block';

}
// Function that handles when a user clicks on the heart icon
function like(e, auth_token, post) {
    const api = new API();
    const p1 = api.get_post(auth_token, post.id);
    const p2 = api.getMe(auth_token);
    var found = false;
    Promise.all([p1,p2]).then((values) => {
        console.log(values[0]);
        console.log(values[1]);
       for (var userId in values[0].meta.likes) {
           // If user already liked the post, the post is unliked
            if (values[0].meta.likes[userId] == values[1].id) {
                found = true;
                api.unlike_post(post.id, auth_token).then(() => {
                    const postLikes = document.getElementById(post.id);
                    api.get_post(auth_token, post.id).then((json) => {
                        postLikes.innerText = json.meta.likes.length + ' likes';
                    })
                })
                return;
            }
       }
    })
    if (found == true) return;
    // Otherwise, post will be liked by user
    api.like_post(post.id, auth_token).then(() => {
        const postLikes = document.getElementById(post.id);
        api.get_post(auth_token, post.id).then((json) => {
            postLikes.innerText = json.meta.likes.length + ' likes';
        })
    })
}

// Close the comments modal
function closeComments(e) {
    const modal = document.getElementById('commentsModal');
    modal.style.display = 'none';
}


// Show the comments modal when the user clicks on the comments link
function showComments(e, post, auth_token) {
    console.log("in show comments");
    var flag = false;
    const modal = document.getElementById('commentsModal');
    const heading = document.getElementById('commentsTitle');
    heading.innerText = "Comments";
    const commentsBody = document.getElementById("comments-body");
    commentsBody.innerText = "";
    const listComments = createElement('ul', null, {class: 'list-group list-group-flush', id :'list-comments'});
    console.log(post);
    const api = new API();
    // Get info on post and show the necessary comments
    api.get_post(auth_token, post.id).then((json => {
        for (var user in json.comments) {
            console.log(json.comments[user]);
            const cur_user = createElement('b', json.comments[user].author, {});
            const comment = createElement('div', null, {class : 'list-group-item'});
            comment.appendChild(cur_user);
            const text = createElement('p', json.comments[user].comment, {class : 'mb-1'});
            const time = createElement('small', timeConverter(json.comments[user].published), {});
            comment.appendChild(text);
            comment.appendChild(time);
            listComments.appendChild(comment);

        }
        commentsBody.appendChild(listComments);
    }))

    const commentBtn = document.getElementById('comment-button');
    const commentInput = document.getElementById('new-comment-desc');
    commentInput.value = "";

    // Function to handle when a new comment is made
    commentBtn.addEventListener('click', (event) => {
        if (flag == true) return;
        flag = true;
        // Just some error checking to ensure we are commenting on the right post
        var temp = e.target.id;
        const pattern = /-comment/i;
        if (pattern.exec(e.target.id)) {
            temp = temp.replace(pattern, '');
            console.log("here");
        }

        if (post.id != temp) return;

        // If empty comment, do nothing
        if (commentInput.value == "") {
            return;
        }

        // Post the comment
        postComment(auth_token, commentInput.value, post).then(() => {
            commentInput.value = "";
        })
        console.log(`${post.id}`);
    });
    modal.style.display = 'block';

}

// Function to handle posting of comments
function postComment(auth_token, desc, post) {
    const api = new API();
    const comment = {};
    console.log("Here in postComment");
    return api.getMe(auth_token)
    .then(json => {

        // Set up the comments object
        comment.author = json.username;
        comment.published = (new Date()).getTime()/1000;
        comment.comment = desc;

        // Make api call, then append to the list the new comment for live updating
        api.make_comment(auth_token, comment, post.id).then(() => {
            
            const listComments = document.getElementById('list-comments');
            console.log(listComments);
            const cur_user = createElement('b', json.username, {});
            const comment = createElement('div', null, {class : 'list-group-item'});
            comment.appendChild(cur_user);
            const text = createElement('p', desc, {class : 'mb-1'});
            const time = createElement('small', timeConverter((new Date()).getTime()/1000), {});
            comment.appendChild(text);
            comment.appendChild(time);

            listComments.appendChild(comment);

            // Also changes the number of comments text under each post
            api.get_post(auth_token, post.id).then((json) => {
                const numComments = document.getElementById(`${post.id}-comment`);
                numComments.innerText = `${json.comments.length} comments`;
            })
            
        })
    })
}
// Function to handle closing of likes modal
function closeLikes(e) {
    console.log("Here in closeLikes");
    const modal = document.getElementById('likesModal');
    modal.style.display = 'none';
}
// Function to handle creation of update profile modal
export function update(auth_token) {
    const modal = document.getElementById('updateModal');
    const updateButton = document.getElementById('update-button');
    const modalBody = document.getElementById('update-body');
    updateButton.addEventListener('click', ()=> {
        const newName = document.getElementById('update-name').value;
        const newPass = document.getElementById('update-pass').value;
        const newEmail = document.getElementById('update-email').value;
        var paras = document.getElementsByClassName('alert alert-danger');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);
        console.log(newName + newPass + newEmail);
        // Some error checking
        if (newName == "" && newPass == "" && newEmail == "") {
            if (!document.getElementById('empty-update-desc-error')) {
                const section = createElement('div', 'Nothing to update', {class : 'alert alert-danger', id : 'empty-update-desc-error'});
                modalBody.appendChild(section);
            }
            return;
        }
        const api = new API();
        const userUpdate = {};
        if (newName !== "") {
            userUpdate.name = newName;
        }
        if (newPass !== "") {
            userUpdate.password = newPass;
        }
        if (newEmail !== "") {
            userUpdate.email = newEmail;
        }
        if (!document.getElementById('success-update')) {
            const section = createElement('div', 'Update successful', {class : 'alert alert-success', id : 'success-update'});
            modalBody.appendChild(section);
        }
        api.update_user(auth_token, userUpdate).then(response => {
            console.log(response);
            if (response.msg != "success") {
                if (!document.getElementById('failure-update')) {
                    const section = createElement('div', 'Update failed', {class : 'alert alert-danger', id : 'failure-update'});
                    modalBody.appendChild(section);
                }
                return;
            }
            if (userUpdate.name) {
                const name = document.getElementById('profile-name-inner');
                if (name == null) return;
                name.innerText = userUpdate.name;
            }
        })
    })
    var paras = document.getElementsByClassName('alert alert-danger');
    while(paras[0]) 
        paras[0].parentNode.removeChild(paras[0]);
        var paras = document.getElementsByClassName('alert alert-success');
    while(paras[0]) 
        paras[0].parentNode.removeChild(paras[0]);
    modal.style.display = 'block';
}

// Function to close the update profile modal
export function closeUpdate() {
    const modal = document.getElementById('updateModal');
    modal.style.display = 'none';  
}

// Function to create the follow modal
export function follow(auth_token) {
    const modal = document.getElementById('followModal');
    const followButton = document.getElementById('follow-button');
    const followTitle = document.getElementById('followTitle');
    followTitle.innerText = "Follow";
    const modalBody = document.getElementById('follow-body');

    // Event listener for when user clicks on the follow button
    followButton.addEventListener('click', ()=> {
        console.log(followTitle.innerText);
        if (followTitle.innerText == "Unfollow") return;
        const followName = document.getElementById('follow-name').value;
        var paras = document.getElementsByClassName('alert alert-success');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);
        var paras = document.getElementsByClassName('alert alert-danger');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);
        // Some error checking
        if (followName == "") {
            if (!document.getElementById('empty-follow-desc-error')) {
                const section = createElement('div', 'Please enter a username', {class : 'alert alert-danger', id : 'empty-follow-desc-error'});
                modalBody.appendChild(section);
            }
            return;
        }
        // Make follow call to API
        const api = new API();
        api.follow(auth_token, followName)
        .then(response => {
            if (response.status != 200) {
                var paras = document.getElementsByClassName('alert alert-danger');
                while(paras[0]) 
                    paras[0].parentNode.removeChild(paras[0]);
                if (!document.getElementById('follow-error')) {
                    const section = createElement('div', 'Username not found', {class : 'alert alert-danger', id : 'follow-error'});
                    modalBody.appendChild(section);
                }
                return;

            } else {
                var paras = document.getElementsByClassName('alert alert-danger');
                while(paras[0]) 
                    paras[0].parentNode.removeChild(paras[0]);
                if (!document.getElementById('follow-success')) {
                    const section = createElement('div', 'Follow successful', {class : 'alert alert-success', id : 'follow-success'});
                    modalBody.appendChild(section);
                }
                const numFollowing = document.getElementById('num-following');
                if (numFollowing == null) {
                    if (document.getElementById('profile-username')) return;
                    makeHome();
                    return;
                }
                else {
                        api.getMe(auth_token).then((user) => {
                        console.log(user);
                        numFollowing.innerText = user.following.length + " following";
                    })
                }
            }
        })
    })
    var paras = document.getElementsByClassName('alert alert-success');
    while(paras[0]) 
        paras[0].parentNode.removeChild(paras[0]);
        var paras = document.getElementsByClassName('alert alert-danger');
    while(paras[0]) 
        paras[0].parentNode.removeChild(paras[0]);
    modal.style.display = 'block';
}

// Function to close the follow modal
export function closeFollowModal() {
    const modal = document.getElementById('followModal');
    modal.style.display = 'none';  
}

// Function to create the unfollow modal - very similar to follow
export function unfollow(auth_token) {
    const modal = document.getElementById('followModal');
    const followButton = document.getElementById('follow-button');
    const followTitle = document.getElementById('followTitle');
    followTitle.innerText = "Unfollow";
    const modalBody = document.getElementById('follow-body');
    var paras = document.getElementsByClassName('alert alert-success');
    while(paras[0]) 
        paras[0].parentNode.removeChild(paras[0]);
        var paras = document.getElementsByClassName('alert alert-danger');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);
    followButton.addEventListener('click', ()=> {
        const followName = document.getElementById('follow-name').value;
        console.log(followTitle.innerText);
        if (followTitle.innerText == "Follow") return;
        var paras = document.getElementsByClassName('alert alert-success');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);
        if (followName == "") {
            if (!document.getElementById('empty-follow-desc-error')) {
                const section = createElement('div', 'Please enter a username', {class : 'alert alert-danger', id : 'empty-follow-desc-error'});
                modalBody.appendChild(section);
            }
            return;
        }
        const api = new API();
        api.unfollow(auth_token, followName)
        .then(response => {
            if (response.status != 200) {
                var paras = document.getElementsByClassName('alert alert-danger');
                while(paras[0]) 
                    paras[0].parentNode.removeChild(paras[0]);
                if (!document.getElementById('unfollow-error')) {
                    const section = createElement('div', 'Username not found', {class : 'alert alert-danger', id : 'unfollow-error'});
                    modalBody.appendChild(section);
                }
                return;

            } else {
                var paras = document.getElementsByClassName('alert alert-danger');
                while(paras[0]) 
                    paras[0].parentNode.removeChild(paras[0]);
                if (!document.getElementById('unfollow-success')) {
                    const section = createElement('div', 'User unfollowed', {class : 'alert alert-success', id : 'unfollow-success'});
                    modalBody.appendChild(section);
                }
                const numFollowing = document.getElementById('num-following');
                if (numFollowing == null) {
                    if (document.getElementById('profile-username')) return;
                    makeHome();
                    return;
                }
                api.getMe(auth_token).then((user) => {
                    console.log(user);
                    numFollowing.innerText = user.following.length + " following";
                })
            }
        })
    })
    modal.style.display = 'block';
}
// Function to close the unfollow modal
export function closeUnFollowModal() {
    const modal = document.getElementById('followModal');
    modal.style.display = 'none';  
}

// Got this off stack overflow, to convert UNIX timestap to a human-readable date time format
function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }


// Given an input element of type=file, grab the data uploaded for use
export function uploadImage(desc, file, auth_token) {

    if (file === undefined ) return false;
    if (desc == "") return false;
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);

    // bad data, let's walk away
    if (!valid)
        return false;
    
    // if we get here we have a valid image
    const reader = new FileReader();
    const img = {};
    reader.onload = (e) => {
        // do something with the data result
        const dataURL = e.target.result;
        console.log(dataURL);
        var pattern;
        if (file.type == 'image/jpeg') {
            pattern = /data:image\/jpeg;base64,/i;
        } else if (file.type == 'image/png') {
            pattern = /data:image\/png;base64,/i;        
        } else {
            pattern = /data:image\/jpg;base64,/i;             
        }
        img.src = dataURL.replace(pattern, '');
        img.description_text = desc;
        const api = new API();
        console.log("Here in uploadImage");
        console.log(auth_token);
        console.log(img);
        api.make_post(auth_token, img).then((json => {
            console.log(json);
            const postId = json.post_id;
            api.get_post(auth_token, postId).then((post) => {
                const feed = document.getElementById('large-feed');
                //feed.appendChild(createPostTile(post, auth_token));
                const post_num = document.getElementById('num-posts');
                if (post_num == null) return;
                feed.insertBefore(createPostTile(post, auth_token), feed.children[2]);
                console.log(post);
                api.getUserByUsername(auth_token, post.meta.author).then((user => {
                    console.log(user);
                    post_num.innerText = `${user.posts.length} posts`;
                }))
            })
        }))

    };

    // this returns a base64 image
    reader.readAsDataURL(file);
}

// Function to make the modal to create a new post, very similar to updateImage
export function postImage(event, auth_token, user) {
    var flag = false;
    var paras = document.getElementsByClassName('alert');
    while(paras[0]) 
        paras[0].parentNode.removeChild(paras[0]);
    const modal = document.getElementById('postsModal');
    const heading = document.getElementById('postsTitle');
    heading.innerText = "Make a new post!";
    const postsBody = document.getElementById("posts-body");
    var postLink = document.getElementById('new-post-link');
    if (postLink == null) {
        postLink = createElement('input', 'Choose your image', {type :'file', id : 'new-post-link'});
        postLink.required = true;
        postsBody.appendChild(postLink);
    } 
    const postFooter = document.getElementById('post-button');
    console.log(postLink.files);

    postFooter.addEventListener('click', (event) => {
        if (flag == true) return;
        flag = true;
        const desc = document.getElementById('new-post-desc');
        // Remove all errors if any
        var paras = document.getElementsByClassName('alert');
        while(paras[0]) 
            paras[0].parentNode.removeChild(paras[0]);
        if (desc.value == "") {
            if (!document.getElementById('empty-post-desc-error')) {
                const section = createElement('div', 'Give it a caption!', {class : 'alert alert-danger', id : 'empty-post-desc-error'});
                postsBody.appendChild(section);
            }
            return;
        }
        if (postLink.files[0] == undefined) {
            if (!document.getElementById('empty-post-img-error')) {
                const section = createElement('div', 'No image uploaded', {class : 'alert alert-danger', id : 'empty-post-img-error'});
                postsBody.appendChild(section);
            }
            return;
        }
        const postPromise = uploadImage(desc.value, postLink.files[0], auth_token);
        console.log(postPromise);
        if (postPromise == false) {
            console.log(desc.value);
            if (!document.getElementById('invalid-post-format-error')) {
                const section = createElement('div', 'Only .jpg, .png, .jpeg format supported', {class : 'alert alert-danger', id : 'invalid-post-format-error'});
                postsBody.appendChild(section);
            }
            return;
        }
        if (!document.getElementById('post-image-successs')) {
            const section = createElement('div', 'Post successfull', {class : 'alert alert-success', id : 'post-image-success'});
            postsBody.appendChild(section);
        }

    });
    //const api = new API();
    modal.style.display = 'block';
}

// Function to close the make a post modal
export function closePosts(event) {
    const modal = document.getElementById('postsModal');
    modal.style.display = 'none';
}



export function checkStore(key) {
    if (window.localStorage)
        return window.localStorage.getItem(key)
    else
        return null
}

// Function to get login details after user clicks login
export function getDetails(event) {
    const username = document.getElementById('name').value;
    const password = document.getElementById('pass').value;
    var user = {};
    user["username"] = username;
    user["password"] = password;

    const api = new API();
    api.authenticate(user)
    .then(response => {
        console.log(response);
        const tok = response.token;
        if (tok === undefined) {
            if (!document.getElementById('login-error')) {
                const section = createElement('div', 'Wrong username/password', {class : 'alert alert-danger', id : 'login-error'});
                const form = document.getElementById('login');
                form.appendChild(section);
            }
        } else {
            window.localStorage.setItem('status', 'loggedIn');
            window.localStorage.setItem('cur_user', username);
            var current = window.location.href;
            window.location.href = current.replace(/#(.*)$/, '') + '#';
            renderFeed(tok);
            console.log("WE HERE");
        }

    });

    /*
    if (checkStore(username) == null) {
        if (!document.getElementById('login-error')) {
            const section = createElement('div', 'Wrong username', {class : 'error', id : 'login-error'});
            const form = document.getElementById('login');
            form.appendChild(section);
        }
        */

       // window.localStorage.setItem('current', checkStore(username));
    
}
// Function to make a user's public profile page
export function showPublicProfile(auth_token, username) {
    window.removeEventListener("scroll", checkLoadMore);
    const api = new API();
    var current = window.location.href;
    window.location.href = current.replace(/#(.*)$/, '') + '#' + `profile=${username}`;
    // Gets the current user by username
    api.getUserByUsername(auth_token, username).then((json) => {
        console.log(json);

        // Got this code off stack overflow, and modified to remove all posts under large-feed
        var feed = document.getElementById("large-feed");
        while (feed.firstChild) {
            feed.removeChild(feed.firstChild);
        }

        // Create necessary DOM elements
        const user = createElement('div', null, {id : 'profile-username'} );
        user.appendChild(createElement('h2', json.username, {id : 'profile-username-inner'}));
        user.appendChild(createElement('small',json.name, {}));
        const info = createElement('ul', null, {class : 'profile-top list-inline'});
        const postsNum = createElement('li', null, {class : 'profile-top-item list-item-inline'});
        postsNum.appendChild(createElement('h4', `${json.posts.length} posts`, {class : 'mb-1'}));
        info.appendChild(postsNum);
        const followersNum = createElement('li', null, {class : 'profile-top-item list-item-inline'});
        followersNum.appendChild(createElement('h4', `${json.followed_num} followers`, {class : 'mb-1'}));
        info.appendChild(followersNum);
        const followingNum = createElement('li', null, {class : 'profile-top-item list-item-inline'});
        followingNum.appendChild(createElement('h4', `${json.following.length} following`, {class : 'mb-1'}));
        info.appendChild(followingNum);
        const likesNum = createElement('li', null, {class : 'profile-top-item list-item-inline'});
        likesNum.appendChild(createElement('h4',null, {class : 'mb-1', id : 'likes-num'}));
        info.appendChild(likesNum);

        feed.appendChild(user);
        feed.appendChild(info);

        // Find total number of likes, by summing likes over all posts of user
        const likes = document.getElementById('likes-num');
        var num_likes = 0;
        const promiseArray = [];
        for (let i = 0; i < json.posts.length; i++) {
             promiseArray.push(api.get_post(auth_token, json.posts[i]));
        }
        Promise.all(promiseArray).then((values) => {
            for (let j = values.length - 1; j >= 0; j--) {
                 const cur_post = createPostTile(values[j], auth_token);
                 num_likes += values[j].meta.likes.length;
                 likes.innerText = `${num_likes} likes`;
                 feed.appendChild(cur_post);
            }
        })

    })
}

// Makes the personal user profile page - very similar to public profile, except you can see a list of people you follow
export function makeProfile(auth_token) {
    window.removeEventListener("scroll", checkLoadMore);
    var current = window.location.href;
    const api = new API();
    api.getMe(auth_token).then((json) => {
        console.log(json);

        // Got this code off stack overflow, and modified to remove all posts under large-feed
        var feed = document.getElementById("large-feed");
        while (feed.firstChild) {
            feed.removeChild(feed.firstChild);
        }

        const user = createElement('div', null, {id : 'profile-username'} );
        window.location.href = current.replace(/#(.*)$/, '') + '#' + `profile=${json.username}`;
        user.appendChild(createElement('h2', json.username, {id : 'profile-username-inner'}));
        user.appendChild(createElement('small',json.name, {id :'profile-name-inner'}));
        const info = createElement('ul', null, {class : 'profile-top list-inline'});
        const postsNum = createElement('li', null, {class : 'profile-top-item list-item-inline'});
        postsNum.appendChild(createElement('h4', `${json.posts.length} posts`, {class : 'mb-1', id : 'num-posts'}));
        info.appendChild(postsNum);
        const followersNum = createElement('li', null, {class : 'profile-top-item list-item-inline'});
        followersNum.appendChild(createElement('h4', `${json.followed_num} followers`, {class : 'mb-1'}));
        info.appendChild(followersNum);
        const followingNum = createElement('li', null, {class : 'profile-top-item list-item-inline'});
        followingNum.appendChild(createElement('h4', `${json.following.length} following`, {class : 'mb-1', style : "cursor:pointer" ,id : 'num-following'}));

        // You can see a list of people you are following by clicking on the following number
        followingNum.addEventListener('click', ()=> showFollowing(auth_token,json.id));
        info.appendChild(followingNum);
        const likesNum = createElement('li', null, {class : 'profile-top-item list-item-inline'});
        likesNum.appendChild(createElement('h4',null, {class : 'mb-1', id : 'likes-num'}));
        info.appendChild(likesNum);

        feed.appendChild(user);
        feed.appendChild(info);
        const likes = document.getElementById('likes-num');
        var num_likes = 0
        const promiseArray = [];
        for (let i = 0; i < json.posts.length; i++) {
            promiseArray.push(api.get_post(auth_token, json.posts[i]));
        }
        Promise.all(promiseArray).then((values) => {
            for (let j = values.length - 1; j >= 0; j--) {
                const cur_post = createPostTile(values[j], auth_token);
                num_likes += values[j].meta.likes.length;
                likes.innerText = `${num_likes} likes`;
                feed.appendChild(cur_post);
            }
        })

    })

}

// Shows all the people the user is following
function showFollowing(auth_token, id) {
    const modal = document.getElementById('likesModal');
    const heading = document.getElementById('likesTitle');
    heading.innerText = "Users you follow";
    const followingBody = document.getElementById("likes-body");
    followingBody.innerText = "";
    const listFollowing = createElement('ul', null, {class: 'list-group list-group-flush'});
    const api = new API();
    api.getUser(auth_token, id).then((user => {
        const following = user.following;
        for (var id in following) {
            console.log(following[id]);
            api.getUser(auth_token,following[id]).then(json => {
                const follow_user = createElement('li', json.username, {class : 'list-group-item'} );
                listFollowing.appendChild(follow_user);
            });
        }
        followingBody.appendChild(listFollowing);
    }))
    const span = document.getElementsByClassName("close")[0];
    span.addEventListener('click', closeLikes);
    modal.style.display = 'block';
}

// Function to handle logging a user out
export function logout(e) {
    window.localStorage.setItem('status', 'loggedOut');
    var main = document.getElementById('large-feed');
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }
    const navbar = document.getElementById('nav');
    while (navbar.firstChild) {
        navbar.removeChild(navbar.firstChild);
    }
    const form = createLoginForm();
    main.appendChild(createLoginForm());
    const button = document.getElementById('submit');
    console.log(button);
    button.addEventListener('click', getDetails);

}