using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B2B_V2.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceManagementMissingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Services",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Services",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Code",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Services");
        }
    }
}
