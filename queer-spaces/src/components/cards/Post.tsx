import React, { Component } from 'react'
import { firebase } from '../'

interface PostPropState{
    category: string,
    text_content?: string | null,
    poll_question?: string | null,
    poll_options?: Array<string> | null,
    image_url?: string | null,
    user_id?: string | null,
    created: firebase.firestore.Timestamp
}
export default class Post extends Component<PostPropState, PostPropState> {
    constructor(props: PostPropState){
        super(props);
        this.state = {
            ...props
        }
    }
    render() {
        return (
            <div>
               <pre>{JSON.stringify(this.state)}</pre>
            </div>
        )
    }
}
