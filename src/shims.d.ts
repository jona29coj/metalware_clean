// Ambient module declarations for subpaths/packages that ship no usable type
// definitions for this project's setup. Without these, importing them from a
// .tsx file under strict mode fails with TS2307/TS7016.
declare module 'three/examples/jsm/controls/OrbitControls';
