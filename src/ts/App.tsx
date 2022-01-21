import React, { FormEvent } from 'react';
import { HorizontalGrid, VerticalGrid } from './layout';
import { HalfCircle } from './shape';
import localization from './localization';
import '../static/css/App.css';

const local = localization.zh;

class InfoPanel extends React.Component<{
    className?: string;
    mode: 'statistic' | 'percent';
}> {
    render() {
        return (
            <div className={this.props.className}>
                <p className={this.props.mode}>{this.props.children}</p>
            </div>
        );
    }
}

class App extends React.Component<
    unknown,
    {
        mode: 'statistic' | 'percent';
        current: number;
        total: number;
        percent: number;
        text: string;
        invalid: boolean;
        tree?: Result;
        token?: string;
        pending: boolean;
    }
> {
    constructor(props: unknown) {
        super(props);
        this.state = {
            mode: 'statistic',
            current: 0,
            total: 0,
            percent: 0,
            text: local.prompt.enterURL,
            invalid: false,
            tree: {},
            token: undefined,
            pending: false
        };
    }

    handleTextChange = (event: FormEvent<HTMLInputElement>) => {
        if (
            this.state.mode == 'percent' &&
            this.state.total &&
            this.state.current != this.state.total
        )
            return;
        this.setState({
            mode: 'statistic',
            total: 0,
            current: 0,
            percent: 0,
            pending: true
        });
        const split = event.currentTarget.value.split('/');
        const token = split[split.length - 2];
        if (token === undefined || token.length != 20) {
            this.setState({
                text: local.prompt.enterURL,
                invalid: true
            });
        } else {
            window
                .xaListDir(token, '/')
                .then((res) => {
                    const result = window.xEvaluate(res);
                    this.setState({
                        text: [
                            local.prompt.linkTotalFiles(result.files),
                            local.prompt.linkTotalFolders(result.folders),
                            local.prompt.linkTotalSize(result.size)
                        ].join('\n'),
                        tree: res,
                        total: result.size,
                        token: token,
                        invalid: false
                    });
                })
                .catch((err) => {
                    const errorInfo = window.xDecodeError(err);
                    this.setState({
                        text: local.error[errorInfo.message],
                        tree: undefined,
                        invalid: true
                    });
                })
                .finally(() => {
                    this.setState({ pending: false });
                });
            this.setState({
                text: local.prompt.loading,
                invalid: false
            });
        }
    };

    handleDownload = () => {
        const percent = this.state.total
            ? this.state.current / this.state.total
            : 0;
        if (this.state.pending) return;
        this.setState({
            mode: 'percent',
            text: `${(percent * 100).toFixed(0)}%`,
            pending: true
        });
        new Promise<void>((resolve, reject) => {
            if (this.state.token === undefined) reject(new Error('1'));
            if (this.state.tree === undefined) reject(new Error('2'));
            resolve();
        })
            .then(async () => {
                const res = await window.xaSelect(local.prompt.selectDirectory);
                if (this.state.token === undefined) throw new Error('1');
                if (this.state.tree === undefined) throw new Error('2');
                if (res === undefined) throw new Error('3');
                return await window.xaDownloadDir(
                    res,
                    this.state.token,
                    this.state.tree,
                    '/',
                    (nBytes: number) => {
                        const percent = this.state.total
                            ? (this.state.current + nBytes) / this.state.total
                            : 0;
                        this.setState({
                            mode: 'percent',
                            current: this.state.current + nBytes,
                            percent: percent,
                            text: `${(percent * 100).toFixed(0)}%`
                        });
                    }
                );
            })
            .then(() =>
                window.xaMessage(
                    'info',
                    local.prompt.downloadSuccess,
                    local.prompt.downloadSuccess,
                    []
                )
            )
            .then(() => {
                this.setState({
                    mode: 'statistic',
                    percent: 0,
                    text: local.prompt.enterURL
                });
            })
            .catch((err) => {
                const msg = local.error[err.message];
                window.xaMessage('error', msg, msg, []);
            })
            .finally(() => {
                this.setState({ pending: false });
            });
    };

    render() {
        const splits = ['6vh', '59vh', '3vh', '14vh', '14vh', '3vh', 'auto'];
        return (
            <div className="root">
                <HorizontalGrid splits={splits}>
                    <div style={{ gridRow: '2', verticalAlign: 'middle' }}>
                        <VerticalGrid
                            splits={['1fr', 'minmax(30%, 300px)', '1fr']}
                        >
                            <div
                                style={{ gridColumn: 2, zIndex: 0 }}
                                className="progress-container"
                            >
                                <HalfCircle
                                    className="progress-bg"
                                    start={0}
                                    end={this.state.percent * 360}
                                />
                            </div>
                            <div
                                style={{ gridColumn: 2, zIndex: 1 }}
                                className="progress-container"
                            >
                                <div className="progress-mask" />
                            </div>
                            <div
                                style={{ gridColumn: 2, zIndex: 2 }}
                                className="progress-container"
                            >
                                <InfoPanel
                                    className="progress-fg"
                                    mode={this.state.mode}
                                >
                                    {this.state.text}
                                </InfoPanel>
                            </div>
                        </VerticalGrid>
                    </div>
                    <div style={{ gridRow: '4' }}>
                        <input
                            className={
                                'link-input' +
                                (this.state.invalid ? ' invalid' : '')
                            }
                            placeholder={local.prompt.enterURL}
                            onChange={this.handleTextChange}
                            type="text"
                        />
                    </div>
                    <div style={{ gridRow: '5' }}>
                        <button
                            className="download-button"
                            onClick={this.handleDownload}
                        >
                            {local.prompt.downloadButton}
                        </button>
                    </div>
                </HorizontalGrid>
            </div>
        );
    }
}

export default App;
