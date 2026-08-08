const ServiceStatusModel = require("../models/serviceStatusModel");
const AdminActionModel = require("../models/adminActionModel");
const BadRequestError = require("../errors/BadRequestError");

const VALID_SERVICES = ["AIRTIME", "DATA", "ELECTRICITY", "CABLE_TV"];

class ServiceStatusService {

    /**
     * Throws if the given service has been explicitly disabled by an admin.
     *
     * Deliberately FAIL-OPEN: if no row exists for this service (e.g. the
     * migration hasn't run, or the row was deleted), this treats the
     * service as enabled rather than blocking it. The alternative
     * (fail-closed) would mean any hiccup in this one lookup takes down
     * every purchase platform-wide. A service is only ever unavailable
     * here because an admin explicitly disabled it — never as a side
     * effect of a DB error on this check.
     */
    static async assertEnabled(serviceName) {

        const status = await ServiceStatusModel.findByName(serviceName);

        if (status && status.is_enabled === false) {
            throw new BadRequestError(
                `${serviceName.replace("_", " ")} is temporarily unavailable. Please try again later.`
            );
        }

    }

    /**
     * Get all service statuses (admin).
     */
    static async getAll() {

        return await ServiceStatusModel.findAll();

    }

    /**
     * Toggle a service on/off (admin).
     */
    static async setEnabled(serviceName, isEnabled, admin) {

        if (!VALID_SERVICES.includes(serviceName)) {
            throw new BadRequestError("Unknown service.");
        }

        const updated = await ServiceStatusModel.setEnabled(
            serviceName,
            isEnabled,
            admin.id
        );

        if (!updated) {
            throw new BadRequestError("Service status row not found. Has the migration been run?");
        }

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: isEnabled ? "SERVICE_ENABLE" : "SERVICE_DISABLE",
            target_type: "service",
            target_id: serviceName
        });

        return updated;

    }

}

module.exports = ServiceStatusService;