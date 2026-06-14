import {
    Body,
    Button,
    Column,
    Container,
    Heading,
    Html,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from "react-email";

interface InvitationEmailProps {
    companyName: string;
    organizationName: string;
    inviterName: string;
    role: string;
    url: string;
}

const InvitationEmail = ({
    companyName,
    organizationName,
    inviterName,
    role,
    url,
}: InvitationEmailProps) => {
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);

    return (
        <Html>
            <Body className="bg-bg-2 m-0 text-center font-sans">
                <Preview>
                    {inviterName} invited you to join {organizationName} on {companyName}
                </Preview>

                <Container className="mobile:mt-0 mx-auto mt-8 w-full max-w-[640px]">
                    <Section>
                        <Section className="bg-bg mobile:px-2 px-6 py-4">
                            {/* Content */}
                            <Section className="bg-bg-2 mobile:px-6 mobile:py-12 rounded-[8px] px-[40px] py-[64px] text-center">
                                <Heading as="h1" className="font-28 text-fg m-0">
                                    You&apos;re invited to join {organizationName}
                                </Heading>

                                <Text className="font-16 text-fg-2 mx-auto mt-8 mb-4 max-w-[420px]">
                                    <strong>{inviterName}</strong> has invited you to join{" "}
                                    <strong>{organizationName}</strong> on {companyName} as a{" "}
                                    <strong>{roleName}</strong>.
                                </Text>

                                <Text className="font-16 text-fg-2 mx-auto mb-8 max-w-[420px]">
                                    Click the button below to accept the invitation and get started.
                                </Text>

                                <Section className="mb-6 text-center">
                                    <Button
                                        href={url}
                                        className="bg-fg font-16 text-fg-inverted inline-block rounded-lg px-7 py-4 text-center leading-6"
                                    >
                                        Accept Invitation
                                    </Button>
                                </Section>

                                <Text className="font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-[420px]">
                                    If the button doesn&apos;t work, copy and paste this link into
                                    your browser:
                                    <br />
                                    <br />
                                    <Link href={url}>{url}</Link>
                                </Text>

                                <Text className="font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-[420px]">
                                    If you weren&apos;t expecting this invitation, you can safely
                                    ignore this email.
                                </Text>
                            </Section>

                            {/* Footer */}
                            <Section className="bg-bg">
                                <Row>
                                    <Column className="px-6 py-10 text-center">
                                        <Text className="font-11 text-fg-3">
                                            © {new Date().getFullYear()} {companyName}. All rights
                                            reserved.
                                        </Text>
                                    </Column>
                                </Row>
                            </Section>
                        </Section>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default InvitationEmail;
