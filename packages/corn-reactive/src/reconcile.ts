import { Compare, WithFlag } from "./type";

const reconcile = <T>(
    p: WithFlag<T>[],
    n: WithFlag<T>[],
    compare: Compare<WithFlag<T>>
): WithFlag<T>[] => {
    // O(m*n)
    let nEnd = n.length;
    let nStart = 0;

    let tmp: WithFlag<T>[] = [];

    for (let pIndex = 0; pIndex < p.length; pIndex++) {
        for (let nIndex = nStart; nIndex < n.length; nIndex++) {
            if (compare(p[pIndex], n[nIndex])) {
                //found in next,set flat to normal
                nStart = nIndex + 1;
                break;
            } else if (nIndex === nEnd - 1) {
                //not found in next,set flag to remove
            }
        }
        if (nStart >= n.length) {
            //not item in n;
        }
    }
    if (nStart < n.length) {
        //not item in p;
    }

    return tmp;
};

export default reconcile;
