import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';


interface MatchParams {
    id: string;
}
interface Props extends RouteComponentProps<MatchParams> {
}
export default class Profile extends Component<Props,{}>{
    render() {
        return (
            <div>
                Profile {this.props.match.params.id}
            </div>
        )
    }
}
