const CommonService = {
  formatDate: (dateString: string) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },
  generateDealerCode: (): string => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    return `DLR${randomDigits}`;
  },
  generateLoanProposalNo: (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number

    return `LPN${year}${month}${day}${randomDigits}`;
  },
  checkPermission: (allowedPermission: string[]): boolean => {
    let hasPermission = false;
    if (localStorage.getItem("permissionsList")) {
      const currentPermissionList = JSON.parse(
        localStorage.getItem("permissionsList") ?? "[]"
      );
      hasPermission = allowedPermission?.some((permission) =>
        currentPermissionList.includes(permission)
      );
    }
    return hasPermission;
  },
};

export default CommonService;
