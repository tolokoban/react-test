import * as React from "react";
import "./word-list.css";
import Icon from "./tfw/view/icon";
import Word from "./word";
import IWord from "./IWord";
import Debouncer from "./tfw/debouncer";


interface IWordListProps {
    words: IWord[];
    onClick?: (name: string) => void;
}

interface IWordListState {
    words: IWord[];
}

export default class WordList extends React.Component<IWordListProps, IWordListState> {
    private readonly refMain: React.RefObject<HTMLDivElement>;
    private readonly refHead: React.RefObject<HTMLDivElement>;
    private readonly refBody: React.RefObject<HTMLDivElement>;
    private readonly refTail: React.RefObject<HTMLDivElement>;
    private lastFirstItemIndex: number;
    private lastVisibleItemsCount: number;
    private lastWordsArray: IWord[];

    constructor(props: IWordListProps) {
        super(props);
        this.refMain = React.createRef();
        this.refHead = React.createRef();
        this.refBody = React.createRef();
        this.refTail = React.createRef();
        this.onScroll = Debouncer(this.onScroll.bind(this), 30);
        this.lastFirstItemIndex = -1;
        this.lastVisibleItemsCount = -1;
        this.lastWordsArray = [];
        this.state = { words: [] };
        window.onresize = this.onScroll;
    }

    onScroll(evt: any = null): void {
        const main = this.refMain.current;
        const head = this.refHead.current;
        const body = this.refBody.current;
        const tail = this.refTail.current;
        if (!main || !head || !body || !tail) return;
        const ITEM_HEIGHT = 36;
        const top = Math.floor(main.scrollTop);
        const height = Math.floor(main.getBoundingClientRect().height);
        const itemsCount = this.props.words.length;
        const firstItemIndex = Math.min(
            itemsCount, Math.floor(top / ITEM_HEIGHT));
        const visibleItemsCount = Math.min(
            itemsCount - firstItemIndex,
            1 + Math.ceil(height / ITEM_HEIGHT)
        );
        const tailCount = this.props.words.length - firstItemIndex - visibleItemsCount;

        head.style.height = `${ITEM_HEIGHT * firstItemIndex}px`;
        body.style.height = `${ITEM_HEIGHT * visibleItemsCount}px`;
        tail.style.height = `${ITEM_HEIGHT * tailCount}px`;

        main.scrollTop = top;
        //console.log(top, `${firstItemIndex}+${visibleItemsCount}+${tailCount}=${firstItemIndex + visibleItemsCount + tailCount}`);
        //console.log(head.style.height, body.style.height, tail.style.height);

        if (this.lastFirstItemIndex !== firstItemIndex
            || this.lastVisibleItemsCount !== visibleItemsCount) {
            this.lastFirstItemIndex = firstItemIndex;
            this.lastVisibleItemsCount = visibleItemsCount;
            this.setState({
                words: this.props.words.slice(firstItemIndex, firstItemIndex + visibleItemsCount)
            });
        }
    }

    render() {
        console.log("RENDER: ", this.props.words.length);
        if (this.props.words.length < 1) {
            return (<div className="word-list-wait">
                <Icon content="wait" size={128} animate={true} />
            </div>);
        }
        if (this.lastWordsArray !== this.props.words) {
            this.lastVisibleItemsCount = -1;
            this.lastWordsArray = this.props.words;
        }
        this.onScroll();
        //console.log("state.word = ", this.state.words);
        return (
            <div className="word-list" onScroll={this.onScroll} ref={this.refMain}>
                <div className="space" ref={this.refHead} />
                <div className="body" ref={this.refBody}>{
                    this.state.words
                        .map(item => {
                            const { name, occurences, types } = item;
                            return <Word key={name} name={name} occurences={occurences} types={types} />
                        })
                }</div>
                <div className="space" ref={this.refTail} />
            </div>
        );
    }
}
