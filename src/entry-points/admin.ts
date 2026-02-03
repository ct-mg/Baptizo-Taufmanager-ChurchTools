import { createApp } from 'vue';
import Admin from '../components/Admin.vue';
import type { EntryPoint } from '../types/extension';

/**
 * Admin Configuration Entry Point
 */
const adminEntryPoint: EntryPoint = ({ element, emit }) => {
    console.log('[Baptizo] Initializing Admin Panel');

    const app = createApp(Admin, {
        onNavigate: (target: string) => {
            console.log('[Baptizo] Navigating to:', target);
            emit('extension:navigate', target);
        }
    });
    app.mount(element);

    return () => {
        console.log('[Baptizo] Cleaning up Admin');
        app.unmount();
    };
};

export default adminEntryPoint;
