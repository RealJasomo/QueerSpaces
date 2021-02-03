import * as icons from '../res/anonymous_icons'
const names : string[] = [...Object.getOwnPropertyNames(icons).slice(1)]
export const generate = () : AnonymousInfo => {
   var index: number = Math.round(names.length*Math.random());
   var number: number = Math.round(Math.random()*8999) + 1000;
   console.log(icons[names[index] as keyof typeof icons])
    return {
        name: `Anonymous ${names[index]} ${number}`,
        username: `@anonymous${names[index]}${number}`,
        image: icons[names[index] as keyof typeof icons].default,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`   
    }
}
export interface AnonymousInfo {
    name: string,
    username: string,
    image: string,
    color: string
}