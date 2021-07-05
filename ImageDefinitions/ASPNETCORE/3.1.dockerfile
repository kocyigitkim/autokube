FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY . .
WORKDIR "./%ProjectName%"
RUN ls -l
RUN dotnet build "%ProjectName%.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "%ProjectName%.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app/run
COPY --from=publish /app/publish .
RUN cp /usr/share/zoneinfo/Europe/Istanbul /etc/localtime
ENTRYPOINT ["dotnet", "%ProjectName%.dll"]