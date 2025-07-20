import GUI from 'lil-gui'

export function createGUI(settings,updateCallback) {

    const gui = new GUI({title:"Settings"})
    gui.domElement.classList.add('lil-gui');
    document.documentElement.setAttribute('data-theme', 'light');
    const genSetGUI=gui.addFolder('General Settings')

    const followMeteorController=genSetGUI
        .add(settings,'followMeteor')

    const metSetGUI=gui.addFolder('Meteor Settings')
    const meteorTypeController=metSetGUI
        .add(settings,'meteorType',
        [ 'rock','copper','ice'])
        .name('Type')
        .onFinishChange(()=>{updateCallback.updateMeteorType(settings.meteorType)})

    const speedMeteorController=metSetGUI
        .add(settings,'meteorSpeed')
        .name('Speed (m/s)')
        .min(1)
        .step(1)
        .listen()
    const meteorTemperatureController=metSetGUI
        .add(settings,'meteorTemperature')
        .name('Temperature (°C)')
        .listen()
    const meteorRadiusController=metSetGUI
        .add(settings,'meteorRadius')
        .name('Radius (m)')
        .min(1)
        .max(100000)
        .step(1)
        .onChange(updateCallback.meteorRadiusUpdate)
        .listen()
    metSetGUI
        .add(settings,'meteorMass')
        .name('Mass (t)')
        .disable()
        .listen()
    metSetGUI
        .add(settings,'gravity')
        .name('Gravity (m/s²)')
        .disable()
        .listen()
    metSetGUI
        .add(settings,'EK')
        .name('EK (KJ)')
        .disable()
        .listen()
    metSetGUI
        .add(settings,'airResistance')
        .name('Air Resistance (N)')
        .disable()
        .listen()
    const lunchController=gui
        .add(settings,'lunch')

    const updateControllersDisplay=(physicsMeteor)=>
    {
        settings.meteorRadius=physicsMeteor.meteorRadius
        settings.meteorTemperature=physicsMeteor.temperature
        settings.meteorSpeed=physicsMeteor.getspeed()
        settings.gravity=physicsMeteor.getGravity()
        settings.meteorMass=Math.ceil(physicsMeteor.meteorMass/1000)
        settings.EK=Math.ceil(physicsMeteor.Ek/1000)
        settings.airResistance=physicsMeteor.getAirResistance()
    }
    const disableGui=()=>{
        followMeteorController.disable()
        meteorTypeController.disable()
        genSetGUI.close()
        speedMeteorController.disable()
        meteorTemperatureController.disable()
        meteorRadiusController.disable()
        lunchController.disable()
    }
    return ({
        gui,
        updateControllersDisplay,
        disableGui})
}