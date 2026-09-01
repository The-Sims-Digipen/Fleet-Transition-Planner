import { Canvas, type ThreeEvent, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Color, InstancedMesh, Object3D } from "three";
import type { Vehicle, YearResult } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";

type CameraPreset = "overview" | "top" | "side";
type Vec3 = [number, number, number];

interface PartInstance {
  vehicleId: string;
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color: string;
}

function InstancedPart({ instances, shape = "box", interactive = false, onSelect, metalness = 0.25, roughness = 0.45, opacity = 1 }: {
  instances: PartInstance[];
  shape?: "box" | "cylinder";
  interactive?: boolean;
  onSelect?: (vehicleId: string) => void;
  metalness?: number;
  roughness?: number;
  opacity?: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  const transform = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    instances.forEach((instance, index) => {
      transform.position.set(...instance.position);
      transform.scale.set(...instance.scale);
      transform.rotation.set(...(instance.rotation ?? [0, 0, 0]));
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
      mesh.setColorAt(index, color.set(instance.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [color, instances, transform]);

  function select(event: ThreeEvent<MouseEvent>) {
    if (!interactive || event.instanceId === undefined) return;
    event.stopPropagation();
    onSelect?.(instances[event.instanceId].vehicleId);
  }

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, instances.length]}
      castShadow={shape !== "box" || metalness > 0}
      receiveShadow
      onClick={select}
      onPointerOver={(event) => {
        if (!interactive) return;
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (interactive) document.body.style.cursor = "auto";
      }}
    >
      {shape === "box"
        ? <boxGeometry args={[1, 1, 1]} />
        : <cylinderGeometry args={[1, 1, 1, 12]} />}
      <meshStandardMaterial
        vertexColors
        metalness={metalness}
        roughness={roughness}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </instancedMesh>
  );
}

function vehicleParts(
  vehicles: Vehicle[],
  activeElectricIds: Set<string>,
  overloaded: boolean,
) {
  const stateColor = (vehicle: Vehicle, diesel: string, electric: string, danger: string) =>
    activeElectricIds.has(vehicle.id) ? (overloaded ? danger : electric) : diesel;
  const part = (vehicle: Vehicle, y: number, zOffset: number, scale: Vec3, color: string, xOffset = 0): PartInstance => ({
    vehicleId: vehicle.id,
    position: [vehicle.parkingPosition.x + xOffset, y, vehicle.parkingPosition.z + zOffset],
    scale,
    color,
  });

  return {
    cargo: vehicles.map((vehicle) => part(vehicle, 1.4, -0.55, [2.12, 2.05, 2.75], stateColor(vehicle, "#475569", "#10b981", "#dc2626"))),
    cabins: vehicles.map((vehicle) => part(vehicle, 1.16, 1.55, [2.08, 1.55, 1.45], stateColor(vehicle, "#64748b", "#34d399", "#ef4444"))),
    stripes: vehicles.map((vehicle) => part(vehicle, 1.22, -0.35, [2.16, 0.13, 3.05], stateColor(vehicle, "#1e293b", "#047857", "#991b1b"))),
    windows: vehicles.map((vehicle) => part(vehicle, 1.53, 2.29, [1.72, 0.68, 0.08], "#07111f")),
    headlights: vehicles.map((vehicle) => part(vehicle, 0.82, 2.36, [1.45, 0.22, 0.09], "#dbeafe")),
    taillights: vehicles.map((vehicle) => part(vehicle, 1.05, -2.03, [1.55, 0.25, 0.09], "#ef4444")),
    wheels: vehicles.flatMap((vehicle) => [-1, 1].flatMap((xDirection) => [-1, 1].map((zDirection) => ({
      vehicleId: vehicle.id,
      position: [vehicle.parkingPosition.x + xDirection * 1.04, 0.42, vehicle.parkingPosition.z + zDirection * 1.3] as Vec3,
      scale: [0.4, 0.3, 0.4] as Vec3,
      rotation: [0, 0, Math.PI / 2] as Vec3,
      color: "#070b12",
    })))).flat(),
  };
}

function parkingParts(vehicles: Vehicle[], selectedVehicleId: string | null) {
  const marks = vehicles.flatMap((vehicle) => {
    const selected = vehicle.id === selectedVehicleId;
    const color = selected ? "#38bdf8" : "#dbeafe";
    return [
      { vehicleId: vehicle.id, position: [vehicle.parkingPosition.x - 1.65, 0.025, vehicle.parkingPosition.z] as Vec3, scale: [0.07, 0.035, 5.45] as Vec3, color },
      { vehicleId: vehicle.id, position: [vehicle.parkingPosition.x + 1.65, 0.025, vehicle.parkingPosition.z] as Vec3, scale: [0.07, 0.035, 5.45] as Vec3, color },
      { vehicleId: vehicle.id, position: [vehicle.parkingPosition.x, 0.025, vehicle.parkingPosition.z - 2.7] as Vec3, scale: [3.36, 0.035, 0.07] as Vec3, color },
    ];
  });
  const selected = vehicles
    .filter((vehicle) => vehicle.id === selectedVehicleId)
    .map((vehicle) => ({
      vehicleId: vehicle.id,
      position: [vehicle.parkingPosition.x, 0.035, vehicle.parkingPosition.z] as Vec3,
      scale: [3.15, 0.025, 5.1] as Vec3,
      color: "#38bdf8",
    }));
  return { marks, selected };
}

function Warehouse() {
  const doors = Array.from({ length: 12 }, (_, index) => -33 + index * 6);
  return (
    <group position={[0, 0, -21]}>
      <mesh position={[0, 4.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[84, 9.6, 5.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.28} roughness={0.68} />
      </mesh>
      {doors.map((x) => (
        <group key={x}>
          <mesh position={[x, 2.35, 2.62]}>
            <planeGeometry args={[4.5, 4.7]} />
            <meshStandardMaterial color="#08111f" metalness={0.58} roughness={0.46} />
          </mesh>
          <pointLight position={[x, 5.2, 3]} color="#38bdf8" intensity={0.75} distance={9} />
        </group>
      ))}
      <mesh position={[0, 7.7, 2.72]}>
        <boxGeometry args={[16, 1.2, 0.2]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.42} />
      </mesh>
    </group>
  );
}

function CameraController({ preset }: { preset: CameraPreset }) {
  const controls = useRef<any>(null);
  const { camera } = useThree();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    const positions: Record<CameraPreset, Vec3> = {
      overview: [58, 47, 58],
      top: [0, 86, 0.1],
      side: [-72, 26, 3],
    };
    camera.position.set(...positions[preset]);
    controls.current?.target.set(0, 0.8, 0);
    controls.current?.update();
  }, [camera, preset]);
  return <OrbitControls ref={controls} makeDefault enableDamping={!reduceMotion} dampingFactor={0.06} target={[0, 0.8, 0]} minDistance={20} maxDistance={135} maxPolarAngle={Math.PI / 2.04} />;
}

function Depot({ yearResult, preset }: { yearResult: YearResult; preset: CameraPreset }) {
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const vehicles = usePlannerStore((state) => state.workspace.plans[activePlanId].vehicles);
  const selectedYear = usePlannerStore((state) => state.selectedYear);
  const selectedVehicleId = usePlannerStore((state) => state.selectedVehicleId);
  const setSelectedVehicleId = usePlannerStore((state) => state.setSelectedVehicleId);
  const electricVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.transitionYear !== null && vehicle.transitionYear <= selectedYear),
    [selectedYear, vehicles],
  );
  const electricIds = useMemo(() => new Set(electricVehicles.map((vehicle) => vehicle.id)), [electricVehicles]);
  const parts = useMemo(() => vehicleParts(vehicles, electricIds, yearResult.exceedsSiteCapacity), [electricIds, vehicles, yearResult.exceedsSiteCapacity]);
  const parking = useMemo(() => parkingParts(vehicles, selectedVehicleId), [selectedVehicleId, vehicles]);
  const chargers = useMemo(() => electricVehicles.map((vehicle) => ({
    vehicleId: vehicle.id,
    position: [vehicle.parkingPosition.x + 1.37, 0.78, vehicle.parkingPosition.z - 2.2] as Vec3,
    scale: [0.38, 1.55, 0.38] as Vec3,
    color: yearResult.exceedsSiteCapacity ? "#ef4444" : "#10b981",
  })), [electricVehicles, yearResult.exceedsSiteCapacity]);

  return (
    <>
      <color attach="background" args={[yearResult.exceedsSiteCapacity ? "#17090f" : "#07101f"]} />
      <fog attach="fog" args={[yearResult.exceedsSiteCapacity ? "#17090f" : "#07101f", 70, 155]} />
      <ambientLight intensity={1.15} color="#dbeafe" />
      <directionalLight position={[35, 55, 35]} intensity={2.1} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-35, 24, -28]} intensity={0.65} color="#38bdf8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[92, 58]} />
        <meshStandardMaterial color="#17202c" roughness={0.94} metalness={0.06} />
      </mesh>
      <Warehouse />
      <InstancedPart instances={parking.selected} metalness={0} roughness={1} opacity={0.2} />
      <InstancedPart instances={parking.marks} metalness={0} roughness={1} />
      <InstancedPart instances={parts.cargo} interactive onSelect={setSelectedVehicleId} metalness={0.34} roughness={0.32} />
      <InstancedPart instances={parts.cabins} interactive onSelect={setSelectedVehicleId} metalness={0.34} roughness={0.32} />
      <InstancedPart instances={parts.stripes} interactive onSelect={setSelectedVehicleId} metalness={0.42} roughness={0.24} />
      <InstancedPart instances={parts.windows} interactive onSelect={setSelectedVehicleId} metalness={0.85} roughness={0.12} />
      <InstancedPart instances={parts.headlights} metalness={0.1} roughness={0.25} />
      <InstancedPart instances={parts.taillights} metalness={0.1} roughness={0.25} />
      <InstancedPart instances={parts.wheels} shape="cylinder" roughness={0.9} />
      <InstancedPart instances={chargers} interactive onSelect={setSelectedVehicleId} metalness={0.55} roughness={0.3} />
      <CameraController preset={preset} />
    </>
  );
}

export function DepotScene({ yearResult }: { yearResult: YearResult }) {
  const [preset, setPreset] = useState<CameraPreset>("overview");
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const planName = usePlannerStore((state) => state.workspace.plans[activePlanId].name);
  const selectedYear = usePlannerStore((state) => state.selectedYear);
  const setSelectedVehicleId = usePlannerStore((state) => state.setSelectedVehicleId);

  return (
    <section className={yearResult.exceedsSiteCapacity ? "depot-scene is-overloaded" : "depot-scene"} aria-label={`3D depot for ${planName} in ${selectedYear}`}>
      <p className="sr-only">{yearResult.electricVehicles} electric and {yearResult.dieselVehicles} diesel vehicles are visible. Peak power is {Math.round(yearResult.peakPowerKW)} kilowatts. {yearResult.exceedsSiteCapacity ? "Site capacity is exceeded." : "Site capacity is within its limit."}</p>
      <div className="scene-canvas">
        <Canvas
          shadows="basic"
          dpr={[1, 1.5]}
          camera={{ position: [58, 47, 58], fov: 48, near: 0.1, far: 250 }}
          onPointerMissed={() => setSelectedVehicleId(null)}
          fallback={<div className="scene-loading">3D view unavailable</div>}
        >
          <Depot yearResult={yearResult} preset={preset} />
        </Canvas>
      </div>
      <div className="scene-title-card"><span className={yearResult.exceedsSiteCapacity ? "live-dot is-danger" : "live-dot"} /><strong>3D Depot Digital Twin</strong><span className="plan-tag">{planName}</span></div>
      <div className="scene-legend" aria-label="Depot legend"><span><i className="legend-swatch diesel" />Diesel</span><span><i className="legend-swatch electric" />EV active</span><span><i className="legend-swatch overload" />Overload</span></div>
      <div className="camera-controls" aria-label="Camera views">
        {(["overview", "top", "side"] as CameraPreset[]).map((view) => <button key={view} className={preset === view ? "camera-button is-active" : "camera-button"} aria-pressed={preset === view} onClick={() => setPreset(view)} type="button">{view === "overview" ? "Overview 3D" : view === "top" ? "Top down" : "Side dock"}</button>)}
      </div>
    </section>
  );
}
