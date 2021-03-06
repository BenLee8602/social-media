import React, { Fragment as Frag, useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import UserContext from "../UserContext";
import Comment from "./Comment";
import Delete from "./Delete";
import Editable from "./Editable";
import Like from "./Like";
import TextPost from "./TextPost";
import UserList from "./UserList";
import "../index.css";
import "../style/Post.css";

function Post({ data, view }) {
    const [user, setUser] = useContext(UserContext);
    const [post, setPost] = useState({ ...data });
    const [error, setError] = useState("loading");

    
    const id = useParams().id;
    
    useEffect(() => {
        if (!id) {
            setError(null);
            return;
        }
        
        fetch(`${process.env.REACT_APP_BACKEND_API}/posts/${id}`)
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                setPost(res.post);
                setError(null);
            }
            else setError("post not found");
        })
        .catch(err => console.log(err));
    }, [id]);


    const handleLike = () => {
        const req = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        };
        
        fetch(`${process.env.REACT_APP_BACKEND_API}/posts/${post._id}/like`, req)
        .then(res => res.json())
        .then(res => setPost({ ...post, likes: res.likes }))
        .catch(err => console.log(err));
    };


    const handleComment = newComment => {
        const req = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ comment: newComment })
        };

        fetch(`${process.env.REACT_APP_BACKEND_API}/posts/${post._id}/comment`, req)
        .then(res => res.json())
        .then(res => {
            if (res.success) setPost({ ...post, comments: [...post.comments, res.comment] });
        })
        .catch(err => console.log(err));
    };


    const handleEdit = caption => {
        const req = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ caption })
        };

        fetch(`${process.env.REACT_APP_BACKEND_API}/posts/${post._id}`, req)
        .then(res => res.json())
        .then(res => { if (res.success) setPost({ ...post, caption: caption }); })
        .catch(err => console.log(err));
    };


    const handleDelete = () => {
        const req = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        };

        fetch(`${process.env.REACT_APP_BACKEND_API}/posts/${post._id}`, req)
        .then(res => res.json())
        .then(res => { if (res.success) setError("post deleted"); })
        .catch(err => console.log(err));
    };
    
    
    if (error) return <h3>{ error }</h3>;

    if (view === "mini") return (<div id= "postMini" className="tile">
        <Link to={`/posts/${post._id}`}><img id="image" src={ post.image } alt="image not found" /></Link>
        <div id="content">
            <h3>
                <Link to={`/users/${post.author}/profile`}>{ post.author }</Link>{"  "}
                <span className="faded">{ new Date(post.posted).toLocaleString() }</span>
            </h3>
            <p id="caption">{ post.caption }</p>
        </div>
    </div>);

    if (view === "likes") return <UserList names={ post.likes } />;

    if (view === "comments") { return (
        <div id="allComments" className="tile">
            { post.comments.map(v => <Comment
                key={v._id}
                comment={v}
                setPost={setPost}
                showReplies
            />) }
        </div>
    ); }

    return (<div className="tile">
        <h3 id="postHeader">
            <Link to={`/users/${post.author}/profile`}>{ post.author }</Link>{"  "}
            <span className="faded">{ new Date(post.posted).toLocaleString() }</span>
        </h3>

        <Link to={`/posts/${post._id}`}><img id="postImage" src={ post.image } alt="image not found" /></Link><br/>

        <div id="postBody">
            <Like likes={ post.likes } handleLike={ handleLike } />
            <TextPost handlePost={ handleComment } display="comment" />
            { post.author === user ? (<div id="postAuthorControls">
                <Editable value={ post.caption } handleSubmit={ handleEdit } />
                <Delete handleDelete={ handleDelete } />
            </div>) : <></> }<br/>

            { post.likes.length ? <>
                { "liked by: " }
                { post.likes.length > 1 ? <>
                    { post.likes.slice(Math.max(0, post.likes.length - 3), Math.max(0, post.likes.length - 1))
                    .map((v, i) => <Frag key={i}><Link to={`/users/${v}/profile`}>{v}</Link>, </Frag>) }
                    { " and " }
                </> : <></> }
                <Link to={`/users/${post.likes[post.likes.length - 1]}/profile`}>{post.likes[post.likes.length - 1]}</Link>
            </> : <></> }
            { post.likes.length ? <Link className="faded" to={`/posts/${post._id}/likes`}> view all</Link> : <></> }<br/>

            <p id="postCaption">{ post.caption }</p>

            {
                post.comments.slice(Math.max(0, post.comments.length - 3), Math.max(0, post.comments.length))
                .map(v => <Comment key={v._id} comment={v} setPost={setPost} />)
            }<br/>
            <Link to={`/posts/${post._id}/comments`} className="faded">view all comments</Link>
        </div>
    </div>)
}

export default Post;
