import * as http from 'https';

export class TezosImageResolver {
    image = 'tezos/tezos';

    getAuthToken(): Promise<string> {    
        return new Promise((resolve) => {
            http.get({
                hostname: 'auth.docker.io',
                path: `/token?service=registry.docker.io&scope=repository:${this.image}:pull`,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }, (res) => {
                var str = ''
                res.on('data', function (chunk) {
                    str += chunk;
                });
        
                res.on('end', function () {
                    resolve(JSON.parse(str).token);
                });
            })
        })
    };

    getTags(authToken: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            http.get({
                hostname: 'registry-1.docker.io',
                path: `/v2/${this.image}/tags/list`,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            }, (res) => {
                const { statusCode } = res;
                const contentType: string = res.headers['content-type'] || "";

                var error = null;
                if (statusCode !== 200) {
                    error = new Error('Tag list request failed.\n' +
                                    `Status Code: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('Tag list response invalid.\n' +
                                    `Expected content type application/json but received ${contentType}`);
                }
                if (error) {
                    res.resume();
                    reject(error);
                }

                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(rawData).tags);
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', (e) => {
                reject(e);
            });
        });
    }

    getLatestTag(tags: string[], cutoff: Date): string {
        var latestTag: { tag:string, sha: string, date: Date } = { tag: '', sha: '', date: new Date(0) };

        tags.forEach((tag: string) => {
            const splits: string[] = tag.split('_');
            if ((splits.length == 3) && (splits[0] === "master") && (splits[1].length == 8) && (splits[2].length == 14)) {
                var date = new Date(Date.UTC(
                    parseInt(splits[2].substr(0, 4)),
                    parseInt(splits[2].substr(4, 2)) - 1,
                    parseInt(splits[2].substr(6, 2)),
                    parseInt(splits[2].substr(8, 2)),
                    parseInt(splits[2].substr(10, 2)),
                    parseInt(splits[2].substr(12, 2)),
                ));

                if ((date.valueOf() > latestTag.date.valueOf()) &&
                    (date.valueOf() < cutoff.valueOf())) {
                    latestTag = {
                        tag: tag,
                        sha: splits[1],
                        date: date
                    }
                };
            }
        })

        return latestTag.tag;
    }

    async getLatestTagAsync(cutoff: Date): Promise<string> {
        const authToken = await this.getAuthToken();
        const tags = await this.getTags(authToken);
        return this.getLatestTag(tags, cutoff);
    }
}
