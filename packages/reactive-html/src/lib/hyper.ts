import CornElement from "./cornElement";

const hyper = <T extends {} = {}>(
    type: string | ((props: T) => CornElement),
    props: T
): CornElement => {
    return new CornElement(type, props);
};

export default hyper;
