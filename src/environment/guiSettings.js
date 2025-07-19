import GUI from 'lil-gui'

export function createGUI(settings,updateCallback) {
    const gui = new GUI({title:"Settings"})
    const genSetGUI=gui.addFolder('General Settings')

    const followMeteorController=genSetGUI
        .add(settings,'followMeteor')

    const metSetGUI=gui.addFolder('Meteor Settings')
    const meteorTypeController=metSetGUI
        .add(settings,'meteorType',
        [ 'rock','copper','ice'])
        .name('Meteor Type')
        .onFinishChange(()=>{updateCallback.updateMeteorType(settings.meteorType)})

    const speedMeteorController=metSetGUI
        .add(settings,'meteorSpeed')
        .min(1)
        .step(1)
        .listen()
    const meteorTemperatureController=metSetGUI
        .add(settings,'meteorTemperature')
        .listen()
    const meteorRadiusController=metSetGUI
        .add(settings,'meteorRadius')
        .min(1)
        .max(100000)
        .step(1)
        .onChange(updateCallback.meteorRadiusUpdate)
        .listen()
    const lunchController=gui
        .add(settings,'lunch')

    const updateControllersDisplay=(physicsMeteor)=>
    {
        settings.meteorRadius=physicsMeteor.meteorRadius
        settings.meteorTemperature=physicsMeteor.temperature
        settings.meteorSpeed=physicsMeteor.getspeed()
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