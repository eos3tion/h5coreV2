
declare const enum CullFace {
    CullFaceNone = 0,
    CullFaceBack = 1,
    CullFaceFront = 2,
    CullFaceFrontBack = 3,
}

declare const enum FrontFaceDirection {
    FrontFaceDirectionCW = 0,
    FrontFaceDirectionCCW = 1
}

declare const enum ShadowMapType {
    BasicShadowMap = 0,
    PCFShadowMap = 1,
    PCFSoftShadowMap = 2
}

declare const enum Side {
    FrontSide = 0,
    BackSide = 1,
    DoubleSide = 2,
}

declare const enum Shading {
    FlatShading = 0,
    SmoothShading = 1,
}

declare const enum Colors {
    NoColors = 0,
    FaceColors = 1,
    VertexColors = 2,
}

declare const enum Blending {
    NoBlending = 0,
    NormalBlending,
    AdditiveBlending,
    SubtractiveBlending,
    MultiplyBlending,
    CustomBlending
}

declare const enum BlendingEquation {
    AddEquation = 100,
    SubtractEquation,
    ReverseSubtractEquation,
    MinEquation,
    MaxEquation
}

declare const enum BlendingFactor {
    // custom blending destination factors
    ZeroFactor = 200,
    OneFactor = 201,
    SrcColorFactor = 202,
    OneMinusSrcColorFactor = 203,
    SrcAlphaFactor = 204,
    OneMinusSrcAlphaFactor = 205,
    DstAlphaFactor = 206,
    OneMinusDstAlphaFactor = 207,
    DstColorFactor = 208,
    OneMinusDstColorFactor = 209,

    // custom blending src factors
    SrcAlphaSaturateFactor = 210,
}

declare const enum DepthModes {
    NeverDepth = 0,
    AlwaysDepth = 1,
    LessDepth = 2,
    LessEqualDepth = 3,
    EqualDepth = 4,
    GreaterEqualDepth = 5,
    GreaterDepth = 6,
    NotEqualDepth = 7,
}

declare const enum Combine {
    MultiplyOperation = 0,
    MixOperation = 1,
    AddOperation = 2,
}

declare const enum ToneMapping {
    NoToneMapping = 0,
    LinearToneMapping = 1,
    ReinhardToneMapping = 2,
    Uncharted2ToneMapping = 3,
    CineonToneMapping = 4,
    ACESFilmicToneMapping = 5,
}

declare const enum Mapping {
    UVMapping = 300,
    CubeReflectionMapping = 301,
    CubeRefractionMapping = 302,
    EquirectangularReflectionMapping = 303,
    EquirectangularRefractionMapping = 304,
    SphericalReflectionMapping = 305,
    CubeUVReflectionMapping = 306,
    CubeUVRefractionMapping = 307,
}

declare const enum Wrapping {
    RepeatWrapping = 1000,
    ClampToEdgeWrapping = 1001,
    MirroredRepeatWrapping = 1002,
}

declare const enum TextureFilter {
    NearestFilter = 1003,
    NearestMipMapNearestFilter = 1004,
    NearestMipMapLinearFilter = 1005,
    LinearFilter = 1006,
    LinearMipMapNearestFilter = 1007,
    LinearMipMapLinearFilter = 1008,
}

declare const enum TextureDataType {
    UnsignedByteType = 1009,
    ByteType = 1010,
    ShortType = 1011,
    UnsignedShortType = 1012,
    IntType = 1013,
    UnsignedIntType = 1014,
    FloatType = 1015,
    HalfFloatType = 1016,
}

declare const enum PixelType {
    UnsignedShort4444Type = 1017,
    UnsignedShort5551Type = 1018,
    UnsignedShort565Type = 1019,
    UnsignedInt248Type = 1020,
}

declare const enum PixelFormat {
    AlphaFormat = 1021,
    RGBFormat = 1022,
    RGBAFormat = 1023,
    LuminanceFormat = 1024,
    LuminanceAlphaFormat = 1025,
    RGBEFormat = RGBAFormat,
    DepthFormat = 1026,
    DepthStencilFormat = 1027,
    RedFormat = 1028,
}

declare const enum CompressedPixelFormat {
    RGB_S3TC_DXT1_Format = 33776,
    RGBA_S3TC_DXT1_Format = 33777,
    RGBA_S3TC_DXT3_Format = 33778,
    RGBA_S3TC_DXT5_Format = 33779,
    RGB_PVRTC_4BPPV1_Format = 35840,
    RGB_PVRTC_2BPPV1_Format = 35841,
    RGBA_PVRTC_4BPPV1_Format = 35842,
    RGBA_PVRTC_2BPPV1_Format = 35843,
    RGB_ETC1_Format = 36196,
    RGBA_ASTC_4x4_Format = 37808,
    RGBA_ASTC_5x4_Format = 37809,
    RGBA_ASTC_5x5_Format = 37810,
    RGBA_ASTC_6x5_Format = 37811,
    RGBA_ASTC_6x6_Format = 37812,
    RGBA_ASTC_8x5_Format = 37813,
    RGBA_ASTC_8x6_Format = 37814,
    RGBA_ASTC_8x8_Format = 37815,
    RGBA_ASTC_10x5_Format = 37816,
    RGBA_ASTC_10x6_Format = 37817,
    RGBA_ASTC_10x8_Format = 37818,
    RGBA_ASTC_10x10_Format = 37819,
    RGBA_ASTC_12x10_Format = 37820,
    RGBA_ASTC_12x12_Format = 37821,
}

declare const enum AnimationActionLoopStyles {
    LoopOnce = 2200,
    LoopRepeat = 2201,
    LoopPingPong = 2202,
}

declare const enum InterpolationModes {
    InterpolateDiscrete = 2300,
    InterpolateLinear = 2301,
    InterpolateSmooth = 2302,
}

declare const enum InterpolationEndingModes {
    ZeroCurvatureEnding = 2400,
    ZeroSlopeEnding = 2401,
    WrapAroundEnding = 2402,
}

declare const enum TrianglesDrawModes {
    TrianglesDrawMode = 0,
    TriangleStripDrawMode = 1,
    TriangleFanDrawMode = 2,
}

declare const enum TextureEncoding {
    LinearEncoding = 3000,
    sRGBEncoding = 3001,
    GammaEncoding = 3007,
    RGBEEncoding = 3002,
    LogLuvEncoding = 3003,
    RGBM7Encoding = 3004,
    RGBM16Encoding = 3005,
    RGBDEncoding = 3006,
}

declare const enum DepthPackingStrategies {
    BasicDepthPacking = 3200,
    RGBADepthPacking = 3201,
}

declare const enum NormalMapTypes {
    TangentSpaceNormalMap = 0,
    ObjectSpaceNormalMap = 1,
}
