import vector from './vector'
import World from './world'
class Meteor{
    constructor(
        position,
        meteorRadius,
        speed,
        temperature,
        launchDirection,
        atmHight,
    )
    {
        let speedDirection = vector.create(launchDirection.x, launchDirection.y ,launchDirection.z);
        this.gravity = 0;
        this.g = vector.create(0,0,0);
        this.totalF = vector.create(0, 0, 0);
        this.position = vector.create(position.x, position.y, position.z);
        this.velocity = speedDirection.multiply(speed);
        this.meteorRadius = meteorRadius;
        this.temperature = temperature;
        this.ablationCoefficient = 0;
        this.heatOfVaporization = 0;
        this.dynamicPressureLimit = 0;
        this.Ek = 0;
        this.meteorDensity = 0;
        this.meteorMass = 0;
        this.atmHight = atmHight

    }

    setMeteorType(type){
        if(type === 1) {//rocky
        this.ablationCoefficient = 0.01;
        this.heatOfVaporization = 6000000;     // J/kg
        this.dynamicPressureLimit = 3000000;    // Pa (تقريب وسط)
    }
        else if(type === 2){//metallic
        this.ablationCoefficient = 0.003;
        this.heatOfVaporization = 8500000;
        this.dynamicPressureLimit = 7000000;
    }
        else if(type === 3){//ice
        this.ablationCoefficient = 0.05;
        this.heatOfVaporization = 2600000;
        this.dynamicPressureLimit = 300000;
    }
    const densities = {
        1: 3000,     
        2: 7800,
        3: 1000
    };

    const density = densities[type];

    this.meteorDensity = density;

    let volume = (4 / 3) * Math.PI * Math.pow(this.meteorRadius , 3);

    this.meteorMass = volume * density;
    }

    toVector(force , multiply , vec){

        let direction = vec.clone();

        direction = direction.multiply(multiply);

        let unitVector = direction.normalize();

        return unitVector.multiply(force);
    }

    heightAboveTheGround(){
        return this.position.getLength() - (World.EarthRaduis + this.meteorRadius);
    }

    gravityAcceleration() {                             //Earth's gravitational acceleration
                                                        //g= G*M / r^2
        let d = this.position.square();

        let G = World.GravitationalConstant;

        let M = World.EarthMass

        this.gravity = (G * M) / d;
    }

    gravityForce() {                                    //Gravity Force
                                                        // W = m . g
        let gForce = this.meteorMass * this.gravity

        this.g = this.toVector(gForce, -1 , this.position);
    }

    atmPressure() {                                     // Atmospheric pressure
                                                        // p = p0 * exp(( -massOfOneAirMolecule * g * h ) / ( R * T ))
        let Tkelvin = this.temperature + 273.15;

        let h = this.heightAboveTheGround();

        let r = World.R;

        let p0 = World.P0;

        let massOfOneAirMolecule = World.MolarMassOfDryAir

        let x = (-1 * massOfOneAirMolecule * this.gravity * h) / (r * Tkelvin);

        return p0 * Math.exp(x);
    }

    airDensity(){                                       // Air Density
                                                        // ρ = p / (Rd * T)
        let Tkelvin = this.temperature + 273.15;

        let p = this.atmPressure();

        let Rd = World.DryGasConstant

        let rho = p / (Rd * Tkelvin); 

        return rho;
    }

    airResistance(){                                    // Air Resistance
                                                        // Fn = (ρ * v² * Cd * A) / 2
        let rho = this.airDensity();

        let vSquared = this.velocity.square();

        let Cd = World.CyrcleDragCoefficient;

        let A = Math.PI * this.meteorRadius * this.meteorRadius;

        let f = (rho * vSquared * Cd *A) / 2;

        return this.toVector(f , -1 , this.velocity);
    }

        
    dynamicPressure() {                                 //air pressure on the meteoroid
                                                        // P =  ρ × v² / 2
        let rho = this.airDensity(); 
        let vSquared = this.velocity.square();

        let pressure = rho * vSquared / 2;

        return pressure;
    }

    burnMass(deltaTime) {                               //Meteor combustion rate
                                                        // dm/dt = (Λ × A × v³) / (2 × Q)
        let Λ = this.ablationCoefficient; // ثابت التبخر (وحدة: kg/m²)
        let Q = this.heatOfVaporization;  // حرارة التبخر (J/kg)

        let A = 4 * Math.PI * this.meteorRadius * this.meteorRadius;

        let vCubed = this.velocity.cube();

        let dm_dt = (Λ * A * vCubed) / (2 * Q);

        let dm = dm_dt * deltaTime;

        return dm;
    }

    massDecrease(deltaTime){

        let dm = this.burnMass(deltaTime);

        this.meteorMass -= dm;

        if (this.meteorMass < 0) {
            this.meteorMass = 0;
        }

        this.updateRadiusFromMass();
    }

    updateRadiusFromMass() {                            //نقصان نصف القطر بسبب نقصان الكتلة
                                                        // r = (3m / 4πρ)^(1/3) لحساب نصف القطر الجديد من الكتلة والكثافة
        if (this.meteorMass <= 0) {

            this.meteorRadius = 0;
            return;
        }

        let density = this.meteorDensity;

        let newRadius = Math.cbrt((3 * this.meteorMass) / (4 * Math.PI * density));

        this.meteorRadius = newRadius;
    }

    coriolisForce() {                                   //coriolis Force
                                                        //Fc = 2 × m × ω × v
        let omega = vector.create(0, World.AngularVelocityForEarth, 0); // rad/s

        let v = this.velocity;

        let cross = vector.create(
            omega.getY() * v.getZ() - omega.getZ() * v.getY(),
            omega.getZ() * v.getX() - omega.getX() * v.getZ(),
            omega.getX() * v.getY() - omega.getY() * v.getX()
        );

        let Fc = cross.multiply(2 * this.meteorMass);

        return Fc;
    }

    KineticEnergy(){                                    // Kinetic Energy
                                                        // Ek = (m * v) / 2
        let m = this.meteorMass;

        let V = this.velocity.square();

        let Ek = (m * V) / 2

        return Ek;
    }

    orbitalPeriod() {                                   // Kepler's Third Law
                                                        // T = sqrt((4 * π^2 * r^3) / (G * (M + m)))

        let rCube = this.position.cube();

        let G = World.GravitationalConstant;
        let M = World.EarthMass;             
        let m = this.meteorMass;             

        let numerator = 4 * Math.PI * Math.PI * rCube;

        let denominator = G * (M + m);

        let T_squared = numerator / denominator;

        let T = Math.sqrt(T_squared); // الزمن الدوري بوحدة الثواني

        return T;
    }

    updateTemperature(deltaTime) {                      // increasing temperature
                                                        // Temp = Fn * dt 
        let dragForce = this.airResistance(); 

        let dragMagnitude = dragForce.getLength(); 

        let addedHeat = dragMagnitude * deltaTime * 0.00005; // معامل تجريبي قابل للتعديل

        this.temperature += addedHeat;
    }

    centrifugalForce() {                                // Centrifugal Force
                                                        // F = m * ω² * r
        let r = this.position.getLength(); 

        let omega = World.AngularVelocityForEarth; 

        let F = this.meteorMass * omega * omega * r;

        return this.toVector(F, 1 , this.position);
    }

    isCrashed(){

        if(this.dynamicPressure() > this.dynamicPressureLimit * 4/* هاد ثابت مشان ما يختفي فجأة*/ || this.meteorMass < 0.1 || this.meteorRadius < 5){

        return true;
        }

        return false;

    }

    isInAtmosphere(){

        return this.heightAboveTheGround() <= this.atmHight;

    }


    checkCollision() {

        return this.heightAboveTheGround() <= 0;
        
    }

    resetForces() {

        this.totalF = vector.create(0, 0, 0);

    }

    updateVelocity(deltaTime) {

        let acceleration = this.totalF.divide(this.meteorMass);

        this.velocity = this.velocity.add(acceleration.multiply(deltaTime));
    }

    updatePosition(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
    }

    update(deltaTime) {

        let F_drag = vector.create(0,0,0);

        this.Ek = this.KineticEnergy();

        if (this.checkCollision() || this.isCrashed()){return;}

        this.resetForces();

        this.gravityAcceleration();

        this.gravityForce();

        if(this.isInAtmosphere()){

            this.massDecrease(deltaTime);
    
            this.updateTemperature(deltaTime);

            F_drag = this.airResistance();

        }

        let F_gravity = this.g;
        let F_coriolis = this.coriolisForce();
        let F_centrifugal = this.centrifugalForce();

        this.totalF = F_gravity.add(F_drag).add(F_coriolis).add(F_centrifugal);

        this.updateVelocity(deltaTime);

        this.updatePosition(deltaTime);
    }

}