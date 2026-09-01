import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import type { Vehicle, YearResult } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";

type CameraPreset = "overview" | "top" | "side";

function scenePosition(vehicle: Vehicle) {
  return {
    x: vehicle.parkingPosition.x,
    z: vehicle.parkingPosition.z * 1.55,
  };
}

function ParkingBay({ vehicle }: { vehicle: Vehicle }) {
  const { x, z } = scenePosition(vehicle);

  return (
    <group position={[x, 0.025, z]}>
      {[-1.65, 1.65].map((lineX) => (
        <mesh key={lineX} position={[lineX, 0, 0]}>
          <boxGeometry args={[0.08, 0.035, 6.3]} />
          <meshBasicMaterial color="#dbeafe" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0, -3.1]}>
        <boxGeometry args={[3.38, 0.035, 0.08]} />
        <meshBasicMaterial color="#dbeafe" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.006, 2.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#172033" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.42, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 18]} />
        <meshStandardMaterial color="#090d14" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.32, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.22} />
      </mesh>
    </group>
  );
}

function Van({ vehicle, electric, overloaded }: {
  vehicle: Vehicle;
  electric: boolean;
  overloaded: boolean;
}) {
  const bodyColor = overloaded && electric ? "#dc2626" : electric ? "#10b981" : "#475569";
  const accentColor = overloaded && electric ? "#991b1b" : electric ? "#065f46" : "#283548";
  const glowColor = overloaded && electric ? "#ef4444" : electric ? "#10b981" : "#000000";
  const { x, z } = scenePosition(vehicle);

  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 1.5, -0.45]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 2.05, 3.55]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={glowColor}
          emissiveIntensity={electric ? 0.14 : 0}
          metalness={0.36}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 1.25, 1.65]} castShadow receiveShadow>
        <boxGeometry args={[2.06, 1.55, 1.75]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={glowColor}
          emissiveIntensity={electric ? 0.12 : 0}
          metalness={0.36}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 1.28, -0.42]}>
        <boxGeometry args={[2.13, 0.14, 3.4]} />
        <meshStandardMaterial color={accentColor} metalness={0.48} roughness={0.22} />
      </mesh>

      <mesh position={[0, 1.73, 2.25]} rotation={[-Math.PI / 6, 0, 0]}>
        <planeGeometry args={[1.75, 1]} />
        <meshStandardMaterial color="#08111f" metalness={0.86} roughness={0.12} />
      </mesh>

      <mesh position={[-1.035, 1.58, 1.62]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.64]} />
        <meshStandardMaterial color="#08111f" metalness={0.86} roughness={0.12} />
      </mesh>
      <mesh position={[1.035, 1.58, 1.62]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.64]} />
        <meshStandardMaterial color="#08111f" metalness={0.86} roughness={0.12} />
      </mesh>

      <mesh position={[0, 0.77, 2.57]}>
        <boxGeometry args={[1.5, 0.43, 0.16]} />
        <meshStandardMaterial color="#0b1220" roughness={0.82} />
      </mesh>

      {[-0.68, 0.68].map((lightX) => (
        <mesh key={lightX} position={[lightX, 0.94, 2.67]}>
          <boxGeometry args={[0.34, 0.2, 0.08]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {[-0.88, 0.88].map((lightX) => (
        <mesh key={lightX} position={[lightX, 1.2, -2.25]}>
          <boxGeometry args={[0.16, 0.46, 0.08]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.65} />
        </mesh>
      ))}

      <Wheel x={-1.03} z={1.42} />
      <Wheel x={1.03} z={1.42} />
      <Wheel x={-1.03} z={-1.48} />
      <Wheel x={1.03} z={-1.48} />
    </group>
  );
}

function Charger({ vehicle, overloaded }: { vehicle: Vehicle; overloaded: boolean }) {
  const { x, z } = scenePosition(vehicle);
  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(0, 1, 0),
        new Vector3(-0.3, 0.45, 0.2),
        new Vector3(-0.9, 0.4, 0.6),
        new Vector3(-1.25, 0.78, 1.2),
      ]),
    [],
  );
  const statusColor = overloaded ? "#ef4444" : "#10b981";

  return (
    <group position={[x + 1.35, 0, z - 2.45]}>
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[0.42, 1.64, 0.42]} />
        <meshStandardMaterial color="#1e293b" metalness={0.62} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.13, 0.22]}>
        <planeGeometry args={[0.28, 0.4]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[0.48, 0.09, 0.48]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.5} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 20, 0.035, 8, false]} />
        <meshStandardMaterial color="#050a12" roughness={0.84} />
      </mesh>
    </group>
  );
}

function Warehouse() {
  return (
    <group position={[0, 0, -10.5]}>
      <mesh position={[0, 4.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 9.6, 5.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.28} roughness={0.68} />
      </mesh>
      {[-10, -5, 0, 5, 10].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.4, 2.62]}>
            <planeGeometry args={[3.6, 4.8]} />
            <meshStandardMaterial color="#0a1220" metalness={0.58} roughness={0.46} />
          </mesh>
          <pointLight position={[x, 5.3, 3]} color="#38bdf8" intensity={1.15} distance={8} />
        </group>
      ))}
      <mesh position={[0, 7.6, 2.7]}>
        <boxGeometry args={[11, 1.25, 0.22]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function CameraController({ preset }: { preset: CameraPreset }) {
  const controls = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    const positions: Record<CameraPreset, [number, number, number]> = {
      overview: [20, 17, 22],
      top: [0, 31, 0.1],
      side: [-23, 8, 2],
    };
    camera.position.set(...positions[preset]);
    controls.current?.target.set(0, 1.2, -1.4);
    controls.current?.update();
  }, [camera, preset]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      target={[0, 1.2, -1.4]}
      minDistance={8}
      maxDistance={52}
      maxPolarAngle={Math.PI / 2.04}
    />
  );
}

function Depot({ yearResult, preset }: { yearResult: YearResult; preset: CameraPreset }) {
  const scenario = usePlannerStore((state) => state.scenario);
  const selectedYear = usePlannerStore((state) => state.selectedYear);

  return (
    <>
      <color attach="background" args={[yearResult.exceedsSiteCapacity ? "#17090f" : "#07101f"]} />
      <fog attach="fog" args={[yearResult.exceedsSiteCapacity ? "#17090f" : "#07101f", 25, 65]} />
      <ambientLight intensity={1.25} color="#dbeafe" />
      <directionalLight position={[18, 25, 15]} intensity={2.35} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-18, 12, -12]} intensity={0.75} color="#38bdf8" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[38, 30]} />
        <meshStandardMaterial color="#17202c" roughness={0.92} metalness={0.08} />
      </mesh>

      {[-12, -8, -4, 0, 4, 8, 12].map((x) => (
        <mesh key={x} position={[x, 0.03, 8.4]}>
          <boxGeometry args={[1.8, 0.04, 0.13]} />
          <meshBasicMaterial color="#fbbf24" toneMapped={false} />
        </mesh>
      ))}

      <Warehouse />

      {scenario.vehicles.map((vehicle) => {
        const electric = vehicle.transitionYear !== null && vehicle.transitionYear <= selectedYear;
        return (
          <group key={vehicle.id}>
            <ParkingBay vehicle={vehicle} />
            <Van vehicle={vehicle} electric={electric} overloaded={yearResult.exceedsSiteCapacity} />
            {electric && <Charger vehicle={vehicle} overloaded={yearResult.exceedsSiteCapacity} />}
          </group>
        );
      })}

      <CameraController preset={preset} />
    </>
  );
}

export function DepotScene({ yearResult }: { yearResult: YearResult }) {
  const [preset, setPreset] = useState<CameraPreset>("overview");
  const scenarioName = usePlannerStore((state) => state.scenario.name);

  return (
    <section className={yearResult.exceedsSiteCapacity ? "depot-scene is-overloaded" : "depot-scene"}>
      <div className="scene-canvas">
        <Canvas shadows="basic" dpr={[1, 1.75]} camera={{ position: [20, 17, 22], fov: 43, near: 0.1, far: 120 }}>
          <Depot yearResult={yearResult} preset={preset} />
        </Canvas>
      </div>

      <div className="scene-title-card">
        <span className={yearResult.exceedsSiteCapacity ? "live-dot is-danger" : "live-dot"} />
        <strong>3D Depot Digital Twin</strong>
        <span className="plan-tag">{scenarioName}</span>
      </div>

      <div className="scene-legend" aria-label="Depot legend">
        <span><i className="legend-swatch diesel" />Diesel</span>
        <span><i className="legend-swatch electric" />EV active</span>
        <span><i className="legend-swatch overload" />Overload</span>
      </div>

      <div className="camera-controls" aria-label="Camera views">
        {(["overview", "top", "side"] as const).map((view) => (
          <button
            key={view}
            className={preset === view ? "camera-button is-active" : "camera-button"}
            onClick={() => setPreset(view)}
            type="button"
          >
            {view === "overview" ? "Overview 3D" : view === "top" ? "Top down" : "Side dock"}
          </button>
        ))}
      </div>
    </section>
  );
}
