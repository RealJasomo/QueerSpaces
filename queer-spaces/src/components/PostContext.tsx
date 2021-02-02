import React, { Component } from 'react'
import {Post, firebase} from './'

interface PostContextState {
    ref: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>,
    documentSnapshot: Array<firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>>
}
export default class PostContext extends Component<{}, PostContextState> {
    
    constructor(props: {}){
        super(props);
        this.state = {
            documentSnapshot:[],
            ref:firebase.firestore().collection('Posts')
        }
    }
    componentDidMount(){
        this.state.ref
        .orderBy('created', 'desc').onSnapshot((snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) =>{
            this.setState({documentSnapshot: snapshot.docs});
        });
    }
    render() {
        let posts = this.state.documentSnapshot.map((doc, idx) => {
        
        return <Post  category={doc.get('category')} text_content={doc.get('text_content')} poll_question={doc.get('poll_question')} poll_options={doc.get('poll_options')} image_url={doc.get('image_url')} user_id={doc.get('user_id')} created={doc.get('created')} key={idx} />
    })
        return (
            <div>
                {posts}
            </div>
        )
    }
}
