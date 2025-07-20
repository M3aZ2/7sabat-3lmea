class world{
    static EarthRaduis = 6356766;
    static GravitationalConstant = 6.67428e-11;
    static EarthMass = 5.972e24;
    static CyrcleDragCoefficient = 0.47;// معامل الشكل للكرة
    static P0 = 101325; // الضغط الجوي عند مستوى سطح البحر bar 1 =100000pa
    static DryGasConstant =  287.058; // ثابت الغازات الجافة
    static MolarMassOfDryAir = 0.028964; // الكتلة المولية للهواء الجاف (kg/mol) mass of one air molecule
    static R = 8.3145; // ثابت الغازات العام (J * K^−1 * mol^−1) general gases constants
    static ScaleHeight = 8.5; //مقياس الارتفاع لكثافة الهواء H
    static AirDensityAtSeaLevel = 1.225;//كثافة الهواء عند سطح البحر
    static AngularVelocityForEarth = 7.292115e-5;//السرعة الزاوية للارض
    static EarthTemperature = 24//حرارة الارض
    static DangerousRateOfHypothermia = 0.0000065;
}
export default world